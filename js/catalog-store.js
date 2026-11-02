(function () {
  let csrfToken = "";

  async function request(url, options) {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Permintaan ke server gagal.");
    }

    return result;
  }

  function withCsrf(headers) {
    if (!csrfToken) {
      throw new Error("Sesi admin tidak aktif. Silakan masuk kembali.");
    }

    return { ...headers, "X-CSRF-Token": csrfToken };
  }

  window.ReviveCatalog = {
    load: async function () {
      const result = await request("api/products.php");
      return result.products;
    },
    create: function (formData, admin) {
      if (admin) {
        formData.set("action", "admin_create");
      } else {
        formData.set("action", "seller");
      }

      return request("api/products.php", {
        method: "POST",
        headers: admin ? withCsrf({}) : {},
        body: formData
      });
    },
    updateImage: function (id, file) {
      const formData = new FormData();
      formData.set("action", "update_image");
      formData.set("id", String(id));
      formData.set("foto", file);

      return request("api/products.php", {
        method: "POST",
        headers: withCsrf({}),
        body: formData
      });
    },
    remove: function (id) {
      return request("api/products.php", {
        method: "DELETE",
        headers: withCsrf({ "Content-Type": "application/json" }),
        body: JSON.stringify({ id: id })
      });
    },
    authStatus: async function () {
      const result = await request("api/auth.php");
      csrfToken = result.csrfToken || "";
      return result;
    },
    login: async function (password) {
      const result = await request("api/auth.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password })
      });
      csrfToken = result.csrfToken;
      return result;
    },
    logout: async function () {
      const result = await request("api/auth.php", {
        method: "DELETE",
        headers: withCsrf({})
      });
      csrfToken = "";
      return result;
    },
    readImage: function (file) {
      return new Promise(function (resolve, reject) {
        if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
          reject(new Error("Pilih file gambar dengan ukuran maksimal 5 MB."));
          return;
        }

        const reader = new FileReader();
        reader.onload = function () {
          const image = new Image();
          image.onload = function () {
            resolve(file);
          };
          image.onerror = function () {
            reject(new Error("File gambar tidak dapat diproses."));
          };
          image.src = reader.result;
        };
        reader.onerror = function () {
          reject(new Error("File gambar tidak dapat dibaca."));
        };
        reader.readAsDataURL(file);
      });
    }
  };
})();
