export default (obj) => {
    const result = {};
    Object.keys(obj).forEach(key => {
      try {
        result[key] = JSON.parse(obj[key]);
      } catch (e) {
        result[key] = obj[key];
      }
    });
    return result;
  }