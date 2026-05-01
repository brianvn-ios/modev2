// ===== HARD FIX WEBVIEW (QUAN TRỌNG NHẤT) =====
if (!sessionStorage.getItem("app_loaded")) {
  sessionStorage.setItem("app_loaded", "1");
  location.reload(); // 🔥 fix lỗi phải bấm back
}

// ===== START APP =====
window.addEventListener("load", () => {
  setTimeout(() => {

    (async function () {
      "use strict";

      const API_URL = "https://api-server-key.tranphat1357t.workers.dev";

      // ===== DEVICE =====
      function getDeviceId() {
        let id = localStorage.getItem("device_id");
        if (!id) {
          id = "DEV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
          localStorage.setItem("device_id", id);
        }
        return id;
      }

      const deviceId = getDeviceId();

      // ===== SAFE FETCH + RETRY =====
      async function safeFetch(url, options = {}, retry = 5) {
        for (let i = 0; i < retry; i++) {
          try {
            const res = await fetch(url, options);

            if (!res.ok) throw new Error("HTTP " + res.status);

            return await res.json();

          } catch (err) {
            if (i === retry - 1) {
              return { ok: false, error: err.message };
            }
            await new Promise(r => setTimeout(r, 1200));
          }
        }
      }

      // ===== WARMUP API =====
      await safeFetch(API_URL);

      // ===== UI =====
      const overlay = document.createElement("div");
      overlay.innerHTML = `
<div id="eliteUI" style="
position:fixed;
inset:0;
background:#000;
display:flex;
justify-content:center;
align-items:center;
z-index:999999;
color:#0ff;
font-family:sans-serif;
">
  <div style="width:320px;text-align:center;">
    <h2>⚡ ELITE TURBO</h2>

    <input id="keyInput" placeholder="Nhập key"
      style="width:100%;padding:10px;border-radius:8px;border:none;background:#111;color:#0ff;" />

    <div style="margin-top:10px;">
      <button id="checkBtn">Check</button>
      <button id="activeBtn">Active</button>
    </div>

    <p id="status">🔄 Đang khởi động...</p>
    <p style="font-size:11px;">UID: ${deviceId}</p>
  </div>
</div>
`;

      document.body.appendChild(overlay);

      const status = document.getElementById("status");

      // ===== API =====
      async function verifyKey(key) {
        return await safeFetch(API_URL + "/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, deviceId })
        });
      }

      async function activateKey(key) {
        return await safeFetch(API_URL + "/api/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, deviceId })
        });
      }

      // ===== AUTO LOGIN (FIX 100%) =====
      await new Promise(r => setTimeout(r, 1500));

      const savedKey = localStorage.getItem("vip_key");

      if (savedKey) {
        status.innerText = "🔄 Đang kiểm tra key...";

        const res = await verifyKey(savedKey);

        if (res.ok) {
          document.getElementById("eliteUI").remove();
          return;
        }
      }

      status.innerText = "✅ Sẵn sàng";

      // ===== BUTTON =====
      document.getElementById("checkBtn").onclick = async () => {
        const key = document.getElementById("keyInput").value.trim();
        if (!key) return status.innerText = "❌ Nhập key";

        status.innerText = "🔄 Đang check...";

        const res = await verifyKey(key);

        status.innerText = res.ok
          ? "✅ Key hợp lệ"
          : "❌ " + (res.error || "Sai key");
      };

      document.getElementById("activeBtn").onclick = async () => {
        const key = document.getElementById("keyInput").value.trim();
        if (!key) return status.innerText = "❌ Nhập key";

        status.innerText = "🔄 Đang kích hoạt...";

        const res = await activateKey(key);

        if (res.ok) {
          localStorage.setItem("vip_key", key);
          status.innerText = "✅ Thành công";

          setTimeout(() => {
            document.getElementById("eliteUI").remove();
          }, 800);

        } else {
          status.innerText = "❌ " + (res.error || "Lỗi");
        }
      };

    })();

  }, 1200);
});
