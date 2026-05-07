export const AUTH_GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', sans-serif; }

  .dg-input {
    width: 100%;
    padding: 11px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #111827;
    background: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dg-input:focus {
    border-color: #7dc832;
    box-shadow: 0 0 0 3px rgba(125,200,50,0.13);
  }

  .dg-select {
    width: 100%;
    padding: 11px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #111827;
    background: #fff;
    outline: none;
    appearance: none;
    transition: border-color 0.2s;
  }
  .dg-select:focus {
    border-color: #7dc832;
    box-shadow: 0 0 0 3px rgba(125,200,50,0.13);
  }

  .dg-spinner {
    width: 18px;
    height: 18px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: dg-spin 0.7s linear infinite;
  }
  @keyframes dg-spin { to { transform: rotate(360deg); } }

  .dg-overlay-slide { transition: transform 0.75s cubic-bezier(0.76,0,0.24,1); }

  .dg-submit { transition: transform 0.25s, box-shadow 0.25s; }
  .dg-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(125,200,50,0.45);
  }
  .dg-submit:disabled { opacity: 0.65; cursor: not-allowed; }

  .dg-ov-btn { transition: background 0.25s, color 0.25s; }
  .dg-ov-btn:hover { background: white !important; color: #5fa820 !important; }
`;export const AUTH_GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', sans-serif; }

  .dg-input {
    width: 100%;
    padding: 11px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #111827;
    background: #fff;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dg-input:focus {
    border-color: #7dc832;
    box-shadow: 0 0 0 3px rgba(125,200,50,0.13);
  }

  .dg-select {
    width: 100%;
    padding: 11px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    color: #111827;
    background: #fff;
    outline: none;
    appearance: none;
    transition: border-color 0.2s;
  }
  .dg-select:focus {
    border-color: #7dc832;
    box-shadow: 0 0 0 3px rgba(125,200,50,0.13);
  }

  .dg-spinner {
    width: 18px;
    height: 18px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: dg-spin 0.7s linear infinite;
  }
  @keyframes dg-spin { to { transform: rotate(360deg); } }

  .dg-overlay-slide { transition: transform 0.75s cubic-bezier(0.76,0,0.24,1); }

  .dg-submit { transition: transform 0.25s, box-shadow 0.25s; }
  .dg-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(125,200,50,0.45);
  }
  .dg-submit:disabled { opacity: 0.65; cursor: not-allowed; }

  .dg-ov-btn { transition: background 0.25s, color 0.25s; }
  .dg-ov-btn:hover { background: white !important; color: #5fa820 !important; }
`;
