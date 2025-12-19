(function () {
  const country = document.getElementById("country");
  const phone = document.getElementById("phone");
  const hint = document.getElementById("phoneHint");

  if (!country || !phone) return;

  const rules = {
    Pakistan: { prefix: "+92", hint: "Pakistan number must start with +92" },
    USA: { prefix: "+1", hint: "USA number must start with +1" },
    UK: { prefix: "+44", hint: "UK number must start with +44" },
  };

  function applyRule() {
    const c = country.value;
    const r = rules[c];

    if (!r) {
      phone.removeAttribute("pattern");
      phone.title = "";
      if (hint) hint.textContent = "";
      return;
    }

    // pattern: must start with prefix then digits
    const escaped = r.prefix.replace("+", "\\+");
    phone.setAttribute("pattern", "^" + escaped + "\\d{6,15}$");
    phone.title = r.hint + " (digits only after prefix)";
    if (hint) hint.textContent = r.hint;
  }

  country.addEventListener("change", applyRule);
  applyRule();
})();
