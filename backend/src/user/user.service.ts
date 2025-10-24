import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiResponseDto } from '../common/response/ApiResponseDto';
import { User, UserRoleEnum, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

// Type for user without sensitive data
export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UserService {
  constructor(private readonly db: PrismaService) {}

  /**
   * Create a new user with hashed password
   */
  async create(
    createUserDto: CreateUserDto,
  ): Promise<ApiResponseDto<SafeUser>> {
    try {
      // Check if user already exists
      const existingUser = await this.db.user.findFirst({
        where: {
          OR: [
            { email: createUserDto.email },
            { name: createUserDto.username },
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === createUserDto.email) {
          throw new ConflictException('Email already exists');
        }
        if (existingUser.name === createUserDto.username) {
          throw new ConflictException('Username already exists');
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create user
      const user = await this.db.user.create({
        data: {
          name: createUserDto.username,
          email: createUserDto.email,
          passwordHash: hashedPassword,
          userRole: createUserDto.userRole || UserRoleEnum.VIEWER,
        },
      });

      // Remove password from response
      const { passwordHash, ...safeUser } = user;

      return {
        data: safeUser,
        message: 'User created successfully',
      };
    } catch (error) {
      // Re-throw known errors
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Log and throw generic error for unknown issues
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Find user by email (includes password hash for authentication)
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by email (without password hash - safe for general use)
   */
  async findUserByEmailSafe(email: string): Promise<ApiResponseDto<SafeUser>> {
    const user = await this.db.user.findUnique({
      where: {
        email,
        isActive: true,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUser } = user;

    return {
      data: safeUser,
      message: 'User retrieved successfully',
    };
  }

  /**
   * Find user by ID (safe - without password)
   */
  async findOne(id: string): Promise<ApiResponseDto<SafeUser>> {
    const user = await this.db.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blog: true,
            comment: true,
          },
        },
      },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUser } = user;

    return {
      data: safeUser,
      message: 'User retrieved successfully',
    };
  }

  /**
   * Find user by ID (includes password hash - for internal use only)
   */
  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({
      where: { id },
    });
  }

  /**
   * Get all active users with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: UserRoleEnum,
  ): Promise<ApiResponseDto<SafeUser[]>> {
    const where: Prisma.UserWhereInput = {
      isActive: true,
      isDeleted: false,
    };

    if (role) {
      where.userRole = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        include: {
          _count: {
            select: {
              blog: true,
              comment: true,
            },
          },
        },
        orderBy: {
          createdOn: 'desc',
        },
        skip,
        take: limit,
      }),
      this.db.user.count({ where }),
    ]);

    // Remove password hashes from all users
    const safeUsers = users.map(({ passwordHash, ...user }) => user);

    return {
      data: safeUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: 'Users retrieved successfully',
    };
  }

  /**
   * Update user profile
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requestUserId: string,
  ): Promise<ApiResponseDto<SafeUser>> {
    // Check if user exists
    const existingUser = await this.db.user.findUnique({
      where: { id },
    });

    if (!existingUser || !existingUser.isActive || existingUser.isDeleted) {
      throw new NotFoundException('User not found');
    }

    // Users can only update their own profile (unless admin logic is added)
    if (existingUser.id !== requestUserId) {
      throw new BadRequestException('You can only update your own profile');
    }

    // Check for email/username conflicts if they're being changed
    if (updateUserDto.email || updateUserDto.username) {
      const conflictingUser = await this.db.user.findFirst({
        where: {
          OR: [
            ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
            ...(updateUserDto.username
              ? [{ name: updateUserDto.username }]
              : []),
          ],
          id: { not: id },
        },
      });

      if (conflictingUser) {
        if (conflictingUser.email === updateUserDto.email) {
          throw new ConflictException('Email already exists');
        }
        if (conflictingUser.name === updateUserDto.username) {
          throw new ConflictException('Username already exists');
        }
      }
    }

    const updatedUser = await this.db.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        updatedBy: requestUserId,
        updatedOn: new Date(),
      },
    });

    const { passwordHash, ...safeUser } = updatedUser;

    return {
      data: safeUser,
      message: 'User updated successfully',
    };
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<ApiResponseDto<{}>> {
    // Get user with password
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.db.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        lastChangedPassword: new Date(),
        updatedBy: userId,
        updatedOn: new Date(),
      },
    });

    return {
      data: {},
      message: 'Password changed successfully',
    };
  }

  /**
   * Update user role (admin only)
   */
  async updateRole(
    userId: string,
    newRole: UserRoleEnum,
    adminId: string,
  ): Promise<ApiResponseDto<SafeUser>> {
    // Verify target user exists
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    // Update role
    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        userRole: newRole,
        updatedBy: adminId,
        updatedOn: new Date(),
      },
    });

    const { passwordHash, ...safeUser } = updatedUser;

    return {
      data: safeUser,
      message: 'User role updated successfully',
    };
  }

  /**
   * Soft delete user account
   */
  async remove(id: string, requestUserId: string): Promise<ApiResponseDto<{}>> {
    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    // Users can only delete their own account (unless admin)
    if (user.id !== requestUserId) {
      throw new BadRequestException('You can only delete your own account');
    }

    await this.db.user.update({
      where: { id },
      data: {
        isActive: false,
        isDeleted: true,
        deletedBy: requestUserId,
        deletedOn: new Date(),
      },
    });

    return {
      data: {},
      message: 'User account deleted successfully',
    };
  }

  /**
   * Count total active users
   */
  async countUsers(): Promise<number> {
    return this.db.user.count({
      where: {
        isActive: true,
        isDeleted: false,
      },
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<
    ApiResponseDto<{
      totalBlogs: number;
      publishedBlogs: number;
      draftBlogs: number;
      totalComments: number;
      totalViews: number;
    }>
  > {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalComments,
      viewsAggregate,
    ] = await Promise.all([
      this.db.blog.count({
        where: {
          authorId: userId,
          isActive: true,
          isDeleted: false,
        },
      }),
      this.db.blog.count({
        where: {
          authorId: userId,
          status: 'PUBLISHED',
          isActive: true,
          isDeleted: false,
        },
      }),
      this.db.blog.count({
        where: {
          authorId: userId,
          status: 'DRAFT',
          isActive: true,
          isDeleted: false,
        },
      }),
      this.db.comment.count({
        where: {
          userId: userId,
          isActive: true,
          isDeleted: false,
        },
      }),
      this.db.blog.aggregate({
        _sum: {
          viewCounts: true,
        },
        where: {
          authorId: userId,
          isActive: true,
          isDeleted: false,
        },
      }),
    ]);

    return {
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalComments,
        totalViews: viewsAggregate._sum.viewCounts || 0,
      },
      message: 'User statistics retrieved successfully',
    };
  }

  /**
   * Verify password (for authentication)
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash!);
  }

  /**
   * Get user's recent activity
   */
  async getUserActivity(userId: string): Promise<
    ApiResponseDto<{
      recentBlogs: any[];
      recentComments: any[];
    }>
  > {
    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive || user.isDeleted) {
      throw new NotFoundException('User not found');
    }

    const [recentBlogs, recentComments] = await Promise.all([
      this.db.blog.findMany({
        where: {
          authorId: userId,
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdOn: true,
          viewCounts: true,
        },
        orderBy: {
          createdOn: 'desc',
        },
        take: 5,
      }),
      this.db.comment.findMany({
        where: {
          userId: userId,
          isActive: true,
          isDeleted: false,
        },
        select: {
          id: true,
          content: true,
          createdOn: true,
          blog: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdOn: 'desc',
        },
        take: 5,
      }),
    ]);

    return {
      data: {
        recentBlogs,
        recentComments,
      },
      message: 'User activity retrieved successfully',
    };
  }
}
