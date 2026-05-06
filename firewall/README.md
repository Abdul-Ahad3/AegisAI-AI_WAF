# Aegis Firewall + VPN (WireGuard) Setup

## Overview

Aegis is a hybrid security system combining: - Application-layer
Firewall (Node.js reverse proxy) - AI-based URL Phishing Detection
(HuggingFace model via backend) - WireGuard VPN Integration for secure
tunneling

The firewall intercepts incoming traffic, analyzes URLs using AI, and
enforces security decisions before forwarding requests.

------------------------------------------------------------------------

## Architecture

Client → Firewall (Node.js) → AI Blocker API → Decision Engine → Target
Server\
(Optional) → Traffic routed via WireGuard VPN (wg0)

------------------------------------------------------------------------

## Features

-   AI-powered phishing detection
-   Reverse proxy-based traffic filtering
-   WireGuard VPN integration
-   Real-time decision engine (Secure / Flagged / Unsafe)
-   Logging for future training pipelines

------------------------------------------------------------------------

## Project Structure

    AegisFirewall/
    │
    ├── firewall/
    │   ├── server.js
    │   ├── aiClient.js
    │   ├── featureExtractor.js
    │
    ├── vpn/
    │   ├── wgService.js
    │
    ├── .env
    ├── README.md

------------------------------------------------------------------------

## Prerequisites

-   Node.js (v18+)
-   npm
-   WireGuard installed (`wg`, `wg-quick`)
-   Linux (recommended)

------------------------------------------------------------------------

## Installation

### 1. Clone Repository

    git clone https://github.com/Abdul-Ahad3/AegisAI-AI_WAF.git

### 2. Install Dependencies

    cd firewall/firewall
    npm install express axios http-proxy-middleware

------------------------------------------------------------------------

## WireGuard Setup

### 1. Generate Keys

    wg genkey | tee privatekey | wg pubkey > publickey

### 2. Create Config

    sudo nano /etc/wireguard/wg0.conf

Example:

    [Interface]
    PrivateKey = <SERVER_PRIVATE_KEY>
    Address = 10.0.0.1/24
    ListenPort = 51820

### 3. Start WireGuard

    sudo wg-quick up wg0

Verify:

    wg show

------------------------------------------------------------------------

## Environment Variables

Create `.env` file:

    NODE_ENV=development
    AI_API_URL=http://localhost:5000/api/check-url
    TARGET_SERVER=http://example.com

------------------------------------------------------------------------

## Running the Firewall

    cd firewall/firewall
    node server.js

Output:

    Firewall running on port 4000

------------------------------------------------------------------------

## API Flow

1.  Request hits firewall
2.  URL extracted
3.  Sent to AI blocker
4.  Response received:
    -   safe → allowed
    -   phishing → blocked
    -   warn → flagged
5.  Forwarded via proxy if allowed

------------------------------------------------------------------------

## Example AI Request

    POST /api/check-url

    {
      "url": "https://example.com"
    }

------------------------------------------------------------------------

## Testing

### 1. Test Firewall

    curl http://localhost:4000/test

### 2. Test AI Integration

Run AI backend and verify responses.

------------------------------------------------------------------------

## VPN Integration

-   Firewall can route traffic via `wg0`
-   Secure tunnel ensures encrypted communication
-   Peer configs dynamically generated via `wgService.js`

------------------------------------------------------------------------

## Advantages

-   AI-enhanced detection vs static rules
-   Modular design
-   VPN + Firewall combined
-   Easy extensibility

------------------------------------------------------------------------

## Limitations

-   Currently URL-based detection only
-   No real-time model training
-   Application-layer only (not deep packet inspection)

------------------------------------------------------------------------

## Future Work

-   Feature-based ML models
-   Real-time training pipeline
-   Admin dashboard
-   Full network-level firewall (NFQUEUE/eBPF)
-   TLS inspection (optional)

------------------------------------------------------------------------

## Author

Final Year Project -- Aegis Security System
