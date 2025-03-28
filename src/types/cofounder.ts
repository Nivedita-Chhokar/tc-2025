
export interface FounderProfile {
  id: string;
  user_id: string;
  skills: Skill[];
  industries: Industry[];
  startup_stage: StartupStage;
  work_style: WorkStyle[];
  goals: string;
  experience: string;
  seeking: string;
  created_at: string;
  updated_at: string;
}

export interface FounderProfileInput {
  skills: string[];
  industries: string[];
  startup_stage: string;
  work_style: string[];
  goals: string;
  experience: string;
  seeking: string;
}

export interface FounderProfileWithUser extends FounderProfile {
  user: {
    id: string;
    full_name: string;
    bio: string;
    avatar_url?: string;
  };
}

export interface FounderMatch {
  id: string;
  founder_id: string;
  matched_founder_id: string;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
}

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export enum StartupStage {
  IDEA = 'idea',
  PROTOTYPE = 'prototype',
  MVP = 'mvp',
  GROWTH = 'growth',
  SCALING = 'scaling'
}

export interface Skill {
  id: string;
  name: string;
}

export interface Industry {
  id: string;
  name: string;
}

export interface WorkStyle {
  id: string;
  name: string;
}