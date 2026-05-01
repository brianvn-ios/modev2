window.addEventListener("load", () => {
  setTimeout(() => {

    (function () {
      "use strict";

      const API_URL = "https://api-server-key.tranphat1357t.workers.dev";

      function getDeviceId() {
        let id = localStorage.getItem("device_id");
        if (!id) {
          id = "DEV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
          localStorage.setItem("device_id", id);
        }
        return id;
      }

      function getTime() {
        return new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh"
        });
      }

      async function safeFetch(url, options = {}) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          const res = await fetch(url, {
            ...options,
            signal: controller.signal
          });

          clearTimeout(timeout);

          if (!res.ok) throw new Error("HTTP " + res.status);

          const data = await res.json();
          return data;

        } catch (err) {
          return { ok: false, error: err.message };
        }
      }

      async function verifyKey(key, deviceId) {
        return await safeFetch(API_URL + "/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, deviceId })
        });
      }

      async function activateKey(key, deviceId) {
        return await safeFetch(API_URL + "/api/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, deviceId })
        });
      }

      // ===== UI =====
      const overlay = document.createElement("div");
      overlay.innerHTML = `
<div id="eliteUI" style="position:fixed;inset:0;background:#000;display:flex;justify-content:center;align-items:center;color:#0ff;z-index:999999">
<div>
<h2>⚡ ELITE TURBO</h2>
<input id="keyInput" placeholder="Nhập key" />
<br><br>
<button id="checkBtn">Check</button>
<button id="activeBtn">Active</button>
<p id="status">Ready...</p>
<p id="uid"></p>
</div>
</div>
`;

      document.body.appendChild(overlay);

      const deviceId = getDeviceId();
      document.getElementById("uid").innerText = deviceId;

      const status = document.getElementById("status");

      document.getElementById("checkBtn").onclick = async () => {
        const key = document.getElementById("keyInput").value.trim();
        if (!key) return status.innerText = "❌ Nhập key";

        status.innerText = "Đang check...";

        const res = await verifyKey(key, deviceId);

        status.innerText = res.ok ? "✅ Key OK" : "❌ " + res.error;
      };

      document.getElementById("activeBtn").onclick = async () => {
        const key = document.getElementById("keyInput").value.trim();
        if (!key) return status.innerText = "❌ Nhập key";

        status.innerText = "Đang kích hoạt...";

        const res = await activateKey(key, deviceId);

        if (res.ok) {
          localStorage.setItem("vip_key", key);
          status.innerText = "✅ Thành công";
          setTimeout(() => {
            document.getElementById("eliteUI").remove();
          }, 800);
        } else {
          status.innerText = "❌ " + res.error;
        }
      };

    })();

  }, 600);
});
