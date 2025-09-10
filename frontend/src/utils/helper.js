// Validate Email
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Add Thousands Separator
export const addThousandsSeparator = (number) => {
  return number.toLocaleString(); 
};
