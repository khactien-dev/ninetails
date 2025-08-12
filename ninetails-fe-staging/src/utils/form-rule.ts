import {
  formatPhoneNumber,
  validateEmoji,
  validateFirstLetter,
  validateMacAddress,
} from './common';

export const checkEmoji = (message: string) => ({
  validator(_: any, value: string) {
    if (!value || !validateEmoji(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(message));
  },
});

export const checkAllspace = (message: string) => ({
  validator(_: any, value: string) {
    if (value && value.trim() === '') {
      return Promise.reject(new Error(message));
    }
    return Promise.resolve();
  },
});

export const checkPhoneNumber = (message: string) => ({
  validator(_: any, value: string) {
    if (!value || formatPhoneNumber(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(message));
  },
});

export const checkID = (message: string) => ({
  validator(_: any, value: string) {
    if (!value || validateFirstLetter(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(message));
  },
});

export const checkMacAddress = (message: string) => ({
  validator(_: any, value: string) {
    if (!value || validateMacAddress(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(message));
  },
});

export const checkNumber = (message: string) => ({
  validator(_: any, value: any) {
    if (value === undefined || value === null || value === '') {
      return Promise.resolve();
    }

    const decimalRegex = /^[0-9]+(\.[0-9]{1,3})?$/;

    if (decimalRegex.test(value)) {
      return Promise.resolve();
    }

    return Promise.reject(new Error(message));
  },
});

export const checkIntNumber = (message: string, isGreaterThanZero = false) => ({
  validator(_: any, value: any) {
    if (value === undefined || value === null || value === '') {
      return Promise.resolve();
    }

    const regex = isGreaterThanZero ? /^[1-9]\d*$/ : /^\d+$/;

    if (regex.test(value)) {
      return Promise.resolve();
    }

    return Promise.reject(new Error(message));
  },
});

export const checkFormatArray = (message: string) => ({
  validator(_: any, value: string) {
    // Trim the input to remove leading/trailing spaces
    const trimmedInput = value.trim();

    // Regular expression to check the expected format
    const regex = /^(\[\d+(,\d+)*\]\s*)+$/;

    // Validate format before proceeding
    if (!regex.test(trimmedInput)) {
      return Promise.reject(new Error(message)); // Return error message if format is invalid
    }

    // If format is valid, proceed with conversion
    const result: number[][] = [];
    const extractRegex = /\[(\d+(?:,\d+)*)\]/g; // Capture groups of numbers in brackets
    let match;

    // Iterate through all matches and push them into the result array
    while ((match = extractRegex.exec(trimmedInput)) !== null) {
      // Split the matched string by comma and convert to numbers
      const row = match[1].split(',').map(Number);
      result.push(row);
    }

    return Promise.resolve(result);
  },
});

export const validateMatrixFormat = (message: string) => ({
  validator(_: any, value: string) {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('Input is not an array.');
      }
      if (parsed.length === 0) {
        throw new Error('Each element in the array cannot be empty.');
      }
      parsed.forEach((innerArray) => {
        if (!Array.isArray(innerArray)) {
          throw new Error('Each item must be an array.');
        }
        if (innerArray.length === 0) {
          throw new Error('Each element in the array cannot be empty.');
        }
        innerArray.forEach((item) => {
          if (typeof item !== 'number') {
            throw new Error('Each element in the inner array must be a number.');
          }
        });
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(message || 'Invalid matrix format.'));
    }
  },
});

export const validateArray = (message: string) => ({
  validator(_: any, value: string) {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('Input is not an array.');
      }
      if (parsed.length === 0) {
        throw new Error('Each element in the array cannot be empty.');
      }
      parsed.forEach((item) => {
        if (typeof item !== 'number') {
          throw new Error('Each element in the array must be a number.');
        }
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(new Error(message || 'Invalid array format.'));
    }
  },
});

export const validateIntNumber = (value: string, isGreaterThanZero = false) => {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  const regex = isGreaterThanZero ? /^[1-9]\d*$/ : /^\d+$/;

  if (!regex.test(value)) {
    return true;
  }

  return false;
};

export const validateFloatNumber = (value: string) => {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  const regex = /^[0-9]+(\.[0-9]+)?$/;

  if (!regex.test(value)) {
    return true;
  }

  return false;
};

export const checkPolygonGeometry = (value: string) => {
  try {
    let isError = false;
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      isError = true;
    }
    if (parsed.length === 0) {
      isError = true;
    }
    parsed.forEach((innerArray: any) => {
      if (!Array.isArray(innerArray)) {
        isError = true;
      }
      if (innerArray.length === 0) {
        isError = true;
      }
      innerArray.forEach((innerArray1: any) => {
        if (!Array.isArray(innerArray1)) {
          isError = true;
        }
        if (innerArray1.length === 0) {
          isError = true;
        }
        innerArray1.forEach((item: any) => {
          if (typeof item !== 'number') {
            isError = true;
          }
        });
      });
    });
    return isError;
  } catch (error) {
    return true;
  }
};

export const checkLinestringGeometry = (value: string) => {
  try {
    let isError = false;
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      isError = true;
    }
    if (parsed.length === 0) {
      isError = true;
    }
    parsed.forEach((innerArray: any) => {
      if (!Array.isArray(innerArray)) {
        isError = true;
      }
      if (innerArray.length === 0) {
        isError = true;
      }
      innerArray.forEach((item: any) => {
        if (typeof item !== 'number') {
          isError = true;
        }
      });
    });
    return isError;
  } catch (error) {
    return true;
  }
};

export const checkPointGeometry = (value: string) => {
  try {
    let isError = false;
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      isError = true;
    }
    if (parsed.length === 0) {
      isError = true;
    }
    parsed.forEach((item: any) => {
      if (typeof item !== 'number') {
        isError = true;
      }
    });
    return isError;
  } catch (error) {
    return true;
  }
};

export const checkTimestamp = (value: string) => {
  const regex = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z)?$/;

  if (!regex.test(value)) {
    return true;
  }

  const date = new Date(value);
  return isNaN(date.getTime());
};

export const checkBoolean = (value: string) => {
  const validValue = ['TRUE', 'FALSE', 'true', 'false'];
  if (validValue.includes(value)) {
    return false;
  } else {
    return true;
  }
};
