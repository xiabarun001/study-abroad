const fs = require('fs');
try {
  const src = "C:\\Users\\sasha\\.gemini\\antigravity-ide\\brain\\d02c5a54-3be5-4cd7-952d-aad2526aa777\\cute_dinosaur_avatar_1779902161148.png";
  const dest = "e:\\Projects\\study-abroad\\src\\assets\\ai_advisor_avatar.png";
  fs.copyFileSync(src, dest);
  console.log("SUCCESS_COPY");
} catch (e) {
  console.error("FAIL_COPY:", e.message);
}
