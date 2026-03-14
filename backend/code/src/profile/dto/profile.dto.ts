import { ApiProperty } from '@nestjs/swagger';
import { Friend, Room, RoomMember, User } from '@prisma/client';

type ProfileDtoProps = Partial<User> &
  Partial<{
    left_friends: Friend[];
    right_friends: Friend[];
    roomMember: RoomMember[];
    owned_rooms: Room[];
    achievement: number;
  }>;

export type NAME = {
  first: string;
  last: string;
};

export type PICTURE = {
  thumbnail: string;
  medium: string;
  large: string;
};

const CLOUDINARY_BASE_URL =
  'https://res.cloudinary.com/ds2oaoirs/image/upload';
const DEFAULT_AVATAR_VERSION = 'v1773493599';
const DEFAULT_AVATAR_PUBLIC_ID =
  'nest-blog/cmmqc4ofy0000w0fkx357af5q.png';

export const buildAvatar = (
  avatar?: string | null,
  name?: NAME | string,
): PICTURE => {
  if (!avatar || avatar.trim() === '') {
    return {
      thumbnail: `${CLOUDINARY_BASE_URL}/c_thumb,h_48,w_48/${DEFAULT_AVATAR_VERSION}/${DEFAULT_AVATAR_PUBLIC_ID}`,
      medium: `${CLOUDINARY_BASE_URL}/c_thumb,h_72,w_72/${DEFAULT_AVATAR_VERSION}/${DEFAULT_AVATAR_PUBLIC_ID}`,
      large: `${CLOUDINARY_BASE_URL}/c_thumb,h_128,w_128/${DEFAULT_AVATAR_VERSION}/${DEFAULT_AVATAR_PUBLIC_ID}`,
    };
  }

  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return {
      thumbnail: avatar,
      medium: avatar,
      large: avatar,
    };
  }

  return {
    thumbnail: `${CLOUDINARY_BASE_URL}/c_thumb,h_48,w_48/${avatar}`,
    medium: `${CLOUDINARY_BASE_URL}/c_thumb,h_72,w_72/${avatar}`,
    large: `${CLOUDINARY_BASE_URL}/c_thumb,h_128,w_128/${avatar}`,
  };
};

export class ProfileDto {
  constructor(userData: ProfileDtoProps, is_friend: boolean) {
    this.id = userData.userId;
    this.profileFinished = userData.profileFinished;
    this.tfa = userData.tfaEnabled;
    this.name = {
      first: userData.firstName,
      last: userData.lastName,
    };
    this.bio = userData.discreption;
    this.phone = '0000000000';
    this.email = userData.email;
    this.picture = buildAvatar(userData.avatar, this.name);
    this.username = userData.Username;
    if (is_friend) {
      this.friendship = [...userData.left_friends, ...userData.right_friends];
    }
    this.achievement = userData.achievement;
  }

  @ApiProperty({ example: 'cln8xxhut0000stofeef' })
  id: string;
  @ApiProperty({ example: true })
  profileFinished: boolean;
  @ApiProperty({ example: true })
  tfa: boolean;
  @ApiProperty({ example: { first: 'John', last: 'Doe' } })
  name: NAME;
  @ApiProperty({ example: 'I am a student' })
  bio: string;
  @ApiProperty({ example: '0000000000' })
  phone: string;
  @ApiProperty({
    example: {
      thumbnail:
        'https://res.cloudinary.com/ds2oaoirs/image/upload/c_thumb,h_48,w_48/v1773493599/nest-blog/cmmqc4ofy0000w0fkx357af5q.png',
      medium:
        'https://res.cloudinary.com/ds2oaoirs/image/upload/c_thumb,h_72,w_72/v1773493599/nest-blog/cmmqc4ofy0000w0fkx357af5q.png',
      large:
        'https://res.cloudinary.com/ds2oaoirs/image/upload/c_thumb,h_128,w_128/v1773493599/nest-blog/cmmqc4ofy0000w0fkx357af5q.png',
    },
  })
  picture: PICTURE;
  @ApiProperty({ example: 'example@mail.com' })
  email: string;

  @ApiProperty({ example: 'dexter' })
  username: string;

  friendship: Friend[];

  @ApiProperty({ example: 1, required: false })
  achievement: number;
}
