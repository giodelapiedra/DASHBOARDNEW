/**
 * This utility function ensures all models are properly loaded
 * before they're used in the application. This helps prevent
 * "MissingSchemaError" when models reference each other.
 */
export async function loadModels() {
  try {
    // Import all models to ensure they are registered with Mongoose
    await Promise.all([
      import('@/models/User'),
      import('@/models/Post'),
      import('@/models/Category')
    ]);
    
    console.log('All models loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading models:', error);
    return false;
  }
} 