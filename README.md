# Okafor-Lindqvist 2025 workpaper

Client-side Next.js prototype for the MiraFlores case study. It reads the Okafor-Lindqvist 2025 tax packet and lets a preparer, reviewer, and partner work open items, trace amounts to source documents, and sign off before filing.

Nothing is stored on a server. Notes, adjustments, sign-offs, client approval, the e-file receipt, and reveal actions live in the browser and reset on refresh.

## Requirements

- Node.js 22 or newer
- npm

JavaScript dependencies are listed in `package.json`. There is no Python runtime, so there is no `requirements.txt`.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## What you can do

The header switches the person you are working as.

- **Priya Raman** prepares: resolves warnings, adjusts the missing crypto basis, and signs as preparer. She can reveal SSNs, IP PINs, and bank numbers. Each reveal is logged.
- **Daniel Ortiz** reviews: review notes block filing until they are cleared. He can sign only after warnings are clear, and he cannot sign work he prepared.
- **Helen Strand** signs as partner. A crypto basis change whose federal or California tax effect is over $1,000 needs her approval.
- **Marcus Bell** can prepare, but he has no sensitive-data clearance, so those values stay masked.

Filing stays blocked until warnings are cleared, due diligence is done, review notes are closed, and preparer, reviewer, and partner have signed. The banner then reads **Ready for client approval**. Ngozi approves the return at `/client`, which changes the banner to **Client approved — ready to e-file**. **E-file return** is only available after that approval. A short simulation then shows **E-filed successfully**, an acknowledgment number, and locks further notes and adjustments. The review and client pages show the same path as Review, Client approval, then E-file.

The packet is `data/okafor_lindqvist_2025_packet.json`. Return figures come from version v3.
