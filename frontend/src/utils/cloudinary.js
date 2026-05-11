// Backend-based Cloudinary upload function
export const uploadImageToBackend = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (data.url) {
      return data.url;
    } else {
      throw new Error('Upload failed: ' + (data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
