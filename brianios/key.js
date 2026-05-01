(function () {
  "use strict";

  const API_URL = "https://api-server-key.tranphat1357t.workers.dev";

  // ===== DEVICE ID =====
  function getDeviceId() {
    let id = localStorage.getItem("device_id");
    if (!id) {
      id = "DEV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem("device_id", id);
    }
    return id;
  }

  // ===== TIME =====
  function getTime() {
    return new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh"
    });
  }

  // ===== DEVICE =====
  function getDevice() {
    return navigator.userAgent;
  }

  // ===== SAFE FETCH (CHỐNG CRASH) =====
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

      const text = await res.text();

      try {
        return JSON.parse(text);
      } catch {
        throw new Error("API không phải JSON");
      }

    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ===== API =====
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
<style>
#eliteUI {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top, #020617, #000);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999999;
  font-family: sans-serif;
  color: #0ff;
}
.box {
  width: 360px;
  padding: 25px;
  border-radius: 18px;
  background: rgba(0,0,0,0.6);
}
.title {text-align:center;font-size:22px;margin-bottom:10px;}
.input {width:100%;padding:10px;border-radius:8px;background:#020617;color:#0ff;border:none;}
.row {display:flex;gap:6px;margin-top:5px;}
.btn {flex:1;padding:10px;border:none;border-radius:8px;background:#00aaff;color:white;}
.info {font-size:11px;margin-top:10px;}
.status {margin-top:10px;text-align:center;}
</style>

<div id="eliteUI">
  <div class="box">
    <div class="title">⚡ ELITE TURBO</div>

    <input id="keyInput" class="input" placeholder="Nhập key..." />

    <div class="row">
      <button id="checkBtn" class="btn">Check</button>
      <button id="activeBtn" class="btn">Active</button>
    </div>

    <div class="info">
      UID: <span id="uid"></span>
    </div>

    <div id="status" class="status">Ready...</div>
    <div id="time" class="status"></div>
  </div>
</div>
`;

  document.body.appendChild(overlay);

  const deviceId = getDeviceId();
  document.getElementById("uid").innerText = deviceId;

  setInterval(() => {
    document.getElementById("time").innerText = getTime();
  }, 1000);

  const status = document.getElementById("status");

  // ===== BUTTON CHECK =====
  document.getElementById("checkBtn").onclick = async () => {
    const key = document.getElementById("keyInput").value.trim();
    if (!key) return status.innerText = "❌ Nhập key";

    status.innerText = "Đang check...";

    const res = await verifyKey(key, deviceId);

    if (res.ok) {
      status.innerText = "✅ Key hợp lệ";
    } else {
      status.innerText = "❌ " + (res.error || "Key sai");
    }
  };

  // ===== BUTTON ACTIVE =====
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
      status.innerText = "❌ " + (res.error || "Lỗi");
    }
  };

  // ===== AUTO LOGIN =====
  (async () => {
    const key = localStorage.getItem("vip_key");
    if (!key) return;

    const res = await verifyKey(key, deviceId);

    if (res.ok) {
      document.getElementById("eliteUI").remove();
    }
  })();

})();
