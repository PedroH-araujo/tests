function isValidISODate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/; 
  if (!dateString.match(regex)) return false;
  const parsedDate = new Date(dateString);
  return !isNaN(parsedDate.getTime());
}

module.exports = isValidISODate;