// src/services/cofounderService.ts
import { supabase } from '../lib/supabase';
import { 
  FounderProfile, 
  FounderProfileInput, 
  FounderProfileWithUser,
  FounderMatch,
  MatchStatus,
  Skill,
  Industry,
  WorkStyle
} from '../types/cofounder';

export const cofounderService = {
  // Profile management
  async getFounderProfile(userId: string): Promise<FounderProfile | null> {
    const { data, error } = await supabase
      .from('founder_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error('Error fetching founder profile:', error);
      throw error;
    }
    
    return data as FounderProfile;
  },

  async createFounderProfile(profile: FounderProfileInput, userId: string): Promise<FounderProfile> {
    const newProfile = {
      user_id: userId,
      skills: profile.skills,
      industries: profile.industries,
      startup_stage: profile.startup_stage,
      work_style: profile.work_style,
      goals: profile.goals,
      experience: profile.experience,
      seeking: profile.seeking,
    };
    
    const { data, error } = await supabase
      .from('founder_profiles')
      .insert(newProfile)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating founder profile:', error);
      throw error;
    }
    
    return data as FounderProfile;
  },

  async updateFounderProfile(profileId: string, updates: Partial<FounderProfileInput>): Promise<FounderProfile> {
    const { data, error } = await supabase
      .from('founder_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating founder profile:', error);
      throw error;
    }
    
    return data as FounderProfile;
  },

  // Potential matches
  async getPotentialMatches(userId: string): Promise<FounderProfileWithUser[]> {
    // Get the user's profile first to match based on skills/industries
    const userProfile = await this.getFounderProfile(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get existing match records to exclude already matched profiles
    const { data: existingMatches, error: matchError } = await supabase
      .from('founder_matches')
      .select('matched_founder_id')
      .eq('founder_id', userProfile.id);

    if (matchError) {
      console.error('Error fetching existing matches:', matchError);
      throw matchError;
    }

    // Extract the IDs of already matched profiles
    const matchedIds = (existingMatches || []).map(match => match.matched_founder_id);

    // Find profiles that:
    // 1. Are not the current user
    // 2. Have not been matched already
    // 3. Have complementary skills (simple implementation - can be enhanced)
    const { data, error } = await supabase
      .from('founder_profiles_with_users')
      .select('*')
      .neq('user_id', userId);
    
    if (error) {
      console.error('Error fetching potential matches:', error);
      throw error;
    }

    // Filter out already matched profiles
    let potentialMatches = (data as FounderProfileWithUser[]).filter(
      profile => !matchedIds.includes(profile.id)
    );

    // Sort matches by relevance (simple algorithm - can be enhanced)
    potentialMatches = this.sortMatchesByRelevance(potentialMatches, userProfile);
    
    return potentialMatches;
  },

  // Sort matches by relevance to the user's profile
  sortMatchesByRelevance(matches: FounderProfileWithUser[], userProfile: FounderProfile): FounderProfileWithUser[] {
    return matches.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Calculate scores based on matching criteria
      // Industry matches
      scoreA += this.calculateIndustryOverlap(a.industries, userProfile.industries);
      scoreB += this.calculateIndustryOverlap(b.industries, userProfile.industries);
      
      // Startup stage compatibility
      scoreA += this.calculateStartupStageCompatibility(a.startup_stage, userProfile.startup_stage);
      scoreB += this.calculateStartupStageCompatibility(b.startup_stage, userProfile.startup_stage);
      
      // Skill complementarity (we want different skills for better founding team)
      scoreA += this.calculateSkillComplementarity(a.skills, userProfile.skills);
      scoreB += this.calculateSkillComplementarity(b.skills, userProfile.skills);
      
      // Sort by highest score first
      return scoreB - scoreA;
    });
  },

  // Helper methods for match scoring
  calculateIndustryOverlap(industries1: Industry[], industries2: Industry[]): number {
    const ids1 = industries1.map(i => i.id);
    const ids2 = industries2.map(i => i.id);
    const overlap = ids1.filter(id => ids2.includes(id)).length;
    return overlap * 2; // Weight industry matches higher
  },

  calculateStartupStageCompatibility(stage1: string, stage2: string): number {
    // Perfect match if same stage
    if (stage1 === stage2) return 3;
    
    // Adjacent stages are somewhat compatible
    const stages = ['idea', 'prototype', 'mvp', 'growth', 'scaling'];
    const index1 = stages.indexOf(stage1);
    const index2 = stages.indexOf(stage2);
    
    if (Math.abs(index1 - index2) === 1) return 1;
    
    return 0;
  },

  calculateSkillComplementarity(skills1: Skill[], skills2: Skill[]): number {
    const ids1 = skills1.map(s => s.id);
    const ids2 = skills2.map(s => s.id);
    
    // Look for complementary skills (different skills are better for co-founders)
    const unique1 = ids1.filter(id => !ids2.includes(id)).length;
    const unique2 = ids2.filter(id => !ids1.includes(id)).length;
    
    return unique1 + unique2;
  },

  // Match management
  async createMatch(founderId: string, matchedFounderId: string): Promise<FounderMatch> {
    const newMatch = {
      founder_id: founderId,
      matched_founder_id: matchedFounderId,
      status: MatchStatus.PENDING
    };
    
    const { data, error } = await supabase
      .from('founder_matches')
      .insert(newMatch)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating match:', error);
      throw error;
    }
    
    return data as FounderMatch;
  },

  async updateMatchStatus(matchId: string, status: MatchStatus): Promise<FounderMatch> {
    const { data, error } = await supabase
      .from('founder_matches')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating match status:', error);
      throw error;
    }
    
    return data as FounderMatch;
  },

  async getReceivedMatchRequests(userId: string): Promise<any[]> {
    // First get the user's founder profile
    const userProfile = await this.getFounderProfile(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get match requests where this user is the matched_founder_id
    const { data, error } = await supabase
      .from('founder_matches_with_profiles')
      .select('*')
      .eq('matched_founder_id', userProfile.id)
      .eq('status', MatchStatus.PENDING);
    
    if (error) {
      console.error('Error fetching received match requests:', error);
      throw error;
    }
    
    return data;
  },

  async getSentMatchRequests(userId: string): Promise<any[]> {
    // First get the user's founder profile
    const userProfile = await this.getFounderProfile(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get match requests sent by this user
    const { data, error } = await supabase
      .from('founder_matches_with_profiles')
      .select('*')
      .eq('founder_id', userProfile.id);
    
    if (error) {
      console.error('Error fetching sent match requests:', error);
      throw error;
    }
    
    return data;
  },

  async getAcceptedMatches(userId: string): Promise<any[]> {
    // First get the user's founder profile
    const userProfile = await this.getFounderProfile(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get accepted matches where this user is either the founder or matched founder
    const { data: sentMatches, error: sentError } = await supabase
      .from('founder_matches_with_profiles')
      .select('*')
      .eq('founder_id', userProfile.id)
      .eq('status', MatchStatus.ACCEPTED);
    
    if (sentError) {
      console.error('Error fetching accepted sent matches:', sentError);
      throw sentError;
    }
    
    const { data: receivedMatches, error: receivedError } = await supabase
      .from('founder_matches_with_profiles')
      .select('*')
      .eq('matched_founder_id', userProfile.id)
      .eq('status', MatchStatus.ACCEPTED);
    
    if (receivedError) {
      console.error('Error fetching accepted received matches:', receivedError);
      throw receivedError;
    }
    
    return [...(sentMatches || []), ...(receivedMatches || [])];
  },

  // Reference data
  async getSkills(): Promise<Skill[]> {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
    
    return data as Skill[];
  },

  async getIndustries(): Promise<Industry[]> {
    const { data, error } = await supabase
      .from('industries')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching industries:', error);
      throw error;
    }
    
    return data as Industry[];
  },

  async getWorkStyles(): Promise<WorkStyle[]> {
    const { data, error } = await supabase
      .from('work_styles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching work styles:', error);
      throw error;
    }
    
    return data as WorkStyle[];
  }
};