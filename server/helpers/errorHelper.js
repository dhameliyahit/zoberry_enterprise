/**
 * Error Handling Helper
 * Sanitizes errors returned to clients while logging full details server-side.
 */

const formatGraphQLError = (formattedError, error) => {
  // Always log the complete error on the server
  console.error('[GraphQL Error]:', {
    message: error.message,
    path: formattedError.path,
    code: formattedError.extensions?.code,
    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
  });

  const code = formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR';

  // If this is an explicit client-facing error (like validation or auth), preserve the message
  if (['UNAUTHENTICATED', 'FORBIDDEN', 'BAD_USER_INPUT', 'NOT_FOUND'].includes(code)) {
    return {
      message: formattedError.message,
      extensions: {
        code,
      },
      path: formattedError.path,
    };
  }

  // Handle Sequelize validation errors cleanly
  if (error.originalError?.name === 'SequelizeValidationError' || error.originalError?.name === 'SequelizeUniqueConstraintError') {
    const customMessage = error.originalError.errors?.[0]?.message || 'Validation error';
    return {
      message: customMessage,
      extensions: {
        code: 'BAD_USER_INPUT',
      },
      path: formattedError.path,
    };
  }

  // In production, do not leak internal system/database details
  if (process.env.NODE_ENV === 'production') {
    return {
      message: 'An unexpected error occurred. Please try again later.',
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }

  // In development, keep readable message
  return {
    message: formattedError.message,
    extensions: {
      code,
    },
    path: formattedError.path,
  };
};

module.exports = {
  formatGraphQLError,
};
