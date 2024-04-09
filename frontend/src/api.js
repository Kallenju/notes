const req = async (url, options = {}) => {
  const { body } = options;

  return fetch(url, {
    ...options,
    body: body ? JSON.stringify(body) : null,
    headers: {
      ...options.headers,
      ...(body
        ? {
            "Content-Type": "application/json",
          }
        : null),
    },
  }).then((res) =>
    res.ok
      ? res.status !== 204
      ? res.json()
      : undefined
      : res.text().then((message) => {
          throw new Error(message);
        })
  );
};

export const signUp = async (email, password) => {
  return req(`${document.location.origin}/api/auth/signup`, {
    method: 'POST',
    body: { email, password }
  });
};

export const login = async (email, password) => {
  return req(`${document.location.origin}/api/auth/login`, {
    method: 'POST',
    body: { email, password }
  });
};

export const logout = async () => {
  return req(`${document.location.origin}/api/auth/logout`, {
    method: 'POST',
  });
};

export const getNotes = async ({ age, search, page } = { age: null, search: null, page: 1 }) => {
  let dates = null;
  let hidden = null;
  let start = 0 + 20 * (page - 1);
  let end = 20 + 20 * (page - 1);
  let titleQuery = search;

  switch (age) {
    case '1month': {
      dates = '1 month';
      hidden = false;

      break;
    }
    case '3months': {
      dates = '3 month';
      hidden = false;

      break;
    }
    case 'alltime': {
      dates = null;
      hidden = false;

      break;
    }
    case 'archive': {
      dates = null;
      hidden = true;

      break;
    }
  }

  let url = `${document.location.origin}/api/notes?`;

  if (dates) {
    url += `dates=${encodeURIComponent(dates)}&`;
  }

  if (typeof hidden === 'boolean') {
    url += `hidden=${encodeURIComponent(hidden)}&`
  }

  if (typeof start === 'number') {
    url += `start=${encodeURIComponent(start)}&`
  }

  if (typeof end === 'number') {
    url += `end=${encodeURIComponent(end)}&`
  }

  if (titleQuery) {
    url += `titleQuery=${encodeURIComponent(titleQuery)}&`
  }

  return req(url, {
    method: 'GET',
  });
};

export const createNote = async (title = '', text = '') => {
  return req(`${document.location.origin}/api/notes`, {
    method: 'POST',
    body: { title, text }
  });
};

export const getNote = async (id) => {
  return req(`${document.location.origin}/api/notes/${id}`, {
    method: 'GET',
  });
};

export const archiveNote = async (id) => {
  return req(`${document.location.origin}/api/notes`, {
    method: 'PATCH',
    body: { id, hidden: true }
  });
}

export const unarchiveNote = async (id) => {
  return req(`${document.location.origin}/api/notes`, {
    method: 'PATCH',
    body: { id, hidden: false }
  });
}

export const editNote = (id, title, text) => {
  return req(`${document.location.origin}/api/notes`, {
    method: 'PATCH',
    body: { id, title, text }
  });
};

export const deleteNote = (id) => {
  return req(`${document.location.origin}/api/notes?noteId=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};

export const deleteAllArchived = () => {
  return req(`${document.location.origin}/api/notes?hidden=${encodeURIComponent(true)}`, {
    method: 'DELETE',
  });
};

export const getGoogleCSRFToken = () => {
  return req(`${document.location.origin}/api/google/issue-csrf-token`, {
    method: 'POST',
  });
};

export const googleSignIn = (credential) => {
  return req(`${document.location.origin}/api/google/signin`, {
    method: 'POST',
    body: { credential }
  });
};

export const facebookSignIn = ({ facebookUserId, facebookAccessToken }) => {
  return req(`${document.location.origin}/api/facebook/signin`, {
    method: 'POST',
    body: { facebookUserId, facebookAccessToken }
  });
};
