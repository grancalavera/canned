import { UserProfileDTO } from "./user-dtos";
import { UserProfile } from "./user-model";

export const userProfileFromDto = (dto: UserProfileDTO): UserProfile => {
  const r = required(dto);

  const login = r("login");
  const avatarUrl = r("avatar_url");
  const htmlUrl = r("html_url");
  const name = dto.name;

  return { login, avatarUrl, htmlUrl, name };
};

const required = <T>(dto: T) => <U extends keyof T>(key: U) => {
  const result = dto[key];

  if (result === undefined || result === null) {
    throw new TypeError(`value for key ${key} is not defined in dto`);
  }

  return result as Exclude<T[U], undefined | null>;
};
