import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { NAME, PICTURE, buildAvatar } from 'src/profile/dto/profile.dto';

export class FriendProfileDto {
  constructor(friend: Partial<User>) {
    this.userId = friend?.userId;
    this.firstname = friend?.firstName;
    this.lastname = friend?.lastName;
    const name: NAME = { first: friend?.firstName, last: friend?.lastName };
    this.avatar = buildAvatar(friend?.avatar, name);
  }

  @ApiProperty({ example: 'cloh36sfy00002v6laxvhdj7r' })
  userId: string;
  @ApiProperty({ example: 'John' })
  firstname: string;
  @ApiProperty({ example: 'Doe' })
  lastname: string;
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
  avatar: PICTURE;
}
