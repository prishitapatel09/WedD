const isValidEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
  };
  
  const isValidName = (name) => {
    const re = /^[a-zA-Z ]+$/;
    return re.test(name);
  };
  
  const isStrongPassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
  };
  
  module.exports = { isValidEmail, isValidName, isStrongPassword };