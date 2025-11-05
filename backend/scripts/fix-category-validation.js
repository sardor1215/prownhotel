const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../routes/admin-products.js');

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Replace the validation line
  const updatedContent = data.replace(
    "body('category').trim().isLength({ min: 1 }).withMessage('Category is required')",
    "body('category_id').isInt({ min: 1 }).withMessage('A valid category is required')"
  );

  // Write the updated content back to the file
  fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully updated category validation in admin-products.js');
  });
});
