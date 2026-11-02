export interface ProfileUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface ProfileData {
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

/** Respuesta de GET /api/profile y PUT /api/profile. */
export interface ProfileResponse {
  user: ProfileUser;
  profile: ProfileData;
}

export interface ProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}