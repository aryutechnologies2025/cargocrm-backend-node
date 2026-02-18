
 const handleValidationError = (error, res) => {
  if (error.name === "ValidationError") {
    const errors = {};
    for (let field in error.errors) {
      errors[field] = error.errors[field].message;
    }
    return res.json({ success: false, errors });
  }
  return null;
};

 const checkExistingRecord = async (Model, query, fieldName, res) => {
  const existing = await Model.findOne(query);
  if (existing) {
    res.json({ 
      success: false, 
      errors: { [fieldName]: `${fieldName} already exists` } 
    });
    return true;
  }
  return false;
};

export { handleValidationError, checkExistingRecord };