
export function isThursdayMiddleware() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // In JavaScript, getDay() returns 4 for Thursday
  return (dayOfWeek === 4)
};

