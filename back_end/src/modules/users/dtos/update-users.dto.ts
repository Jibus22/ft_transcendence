
export class UpdateUserDto {
  login?: string;
  login_42?: string;
  ws_id?: string | null;
  photo_url_42?: string;
  use_local_photo?: boolean;
  twoFASecret?: string | null;
  useTwoFA?: boolean;
  is_in_game?: boolean;
}
