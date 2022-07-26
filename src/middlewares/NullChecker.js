const NullChecker = (...arguments) => {
  let result = false

  for(let i = 0; i < arguments.length; i++){
    //console.log(arguments[i]);
    if(arguments[i] === undefined) result = true;
  }
  return result;
};

module.exports = NullChecker;