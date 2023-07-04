export const duplicateCheck = (email, users_from_database) => {
    return users_from_database.filter((user) => user.email === email);
  };
  