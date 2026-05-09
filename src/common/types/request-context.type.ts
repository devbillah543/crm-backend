export type ActorType = 'user' | 'automation' | 'api' | 'db_direct' | 'migration' | 'system';

export type RequestContextState = {
  requestId: string;
  path?: string;
  method?: string;
  actorType: ActorType;
  actorUserId?: string | null;
  actorEmail?: string | null;
};
