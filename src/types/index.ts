export interface BlogPost {
    id: string;
    title: string;
    content: string;
    summary?: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
    author_id: string;
    author_name?: string;
    published: boolean;
  }
  
  export interface BlogPostInput {
    title: string;
    content: string;
    summary?: string;
    image_url?: string;
    published?: boolean;
  }
  
  export interface User {
    id: string;
    email: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
  }
  
  export interface Profile {
    id: string;
    full_name?: string;
    bio?: string;
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
  }