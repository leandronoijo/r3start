export interface HelloResponse {
  message: string;
}
export interface PersonalHelloResponse extends HelloResponse {
  fullName: string;
}
