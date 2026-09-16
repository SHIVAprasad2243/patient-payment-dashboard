export const formatINR = (value) => {
  const num = Number(value || 0);
  // Use en-IN locale for Indian number grouping
  try {
    return `₹${num.toLocaleString('en-IN')}`;
  } catch (e) {
    return `₹${num}`;
  }
};

export const formatINRNoSymbol = (value) => {
  if (value === '' || value === null || typeof value === 'undefined') return '';
  const num = Number(value || 0);
  try {
    return num.toLocaleString('en-IN');
  } catch (e) {
    return String(num);
  }
};

export default formatINR;
