import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthThrottle, ReadThrottle } from '../common/decorators/throttle.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @AuthThrottle()
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account with email and password. Returns JWT token for immediate authentication.'
  })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration credentials',
    examples: {
      example1: {
        summary: 'Valid registration',
        value: {
          email: 'user@example.com',
          password: 'securePassword123'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT token for authentication',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '4f90f790-cb59-42ec-9269-edf0e2c47177' },
            email: { type: 'string', example: 'user@example.com' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Email already exists' }
      }
    }
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded (5 requests per minute)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' }
      }
    }
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @AuthThrottle()
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticates user with email and password. Returns JWT token for accessing protected endpoints.'
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    examples: {
      example1: {
        summary: 'Valid login',
        value: {
          email: 'user@example.com',
          password: 'securePassword123'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'JWT token for authentication',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '4f90f790-cb59-42ec-9269-edf0e2c47177' },
            email: { type: 'string', example: 'user@example.com' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Invalid credentials' }
      }
    }
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded (5 requests per minute)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' }
      }
    }
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @ReadThrottle()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Returns current user profile information. Requires valid JWT token in Authorization header.'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '4f90f790-cb59-42ec-9269-edf0e2c47177' },
        email: { type: 'string', example: 'user@example.com' },
        iat: { type: 'number', example: 1759309797 },
        exp: { type: 'number', example: 1759396197 }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded (60 requests per minute)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' }
      }
    }
  })
  getProfile(@Request() req) {
    return req.user;
  }
}