const { CSHA256 } = require('sha2');

function isBigEndian() {
    const bint = { i: 0x01020304 };
    return bint.c[0] === 1;
}

function swapByteOrder16(us) {
    if (isBigEndian()) return;
    us = ((us >> 8) & 0x00ff) | ((us << 8) & 0xff00);
}

function swapByteOrder32(ui) {
    if (isBigEndian()) return;
    ui = ((ui >> 24) & 0x000000ff) | ((ui << 8) & 0x00ff0000) | ((ui >> 8) & 0x0000ff00) | ((ui << 24) & 0xff000000);
}

function swapByteOrder64(ull) {
    if (isBigEndian()) return;
    ull =
        ((ull >> 56) & 0x00000000000000ff) |
        ((ull << 40) & 0x00ff000000000000) |
        ((ull << 24) & 0x0000ff0000000000) |
        ((ull << 8) & 0x000000ff00000000) |
        ((ull >> 8) & 0x00000000ff000000) |
        ((ull >> 24) & 0x0000000000ff0000) |
        ((ull >> 40) & 0x000000000000ff00) |
        ((ull << 56) & 0xff00000000000000);
}

function hashToAddress(version, hash) {
    const Base58 = require('base-58');
    const { CKeyID, CScriptID, Params } = require('bitcoinjs-lib');

    const base58PrefixPubKeyAddress = Params().base58Prefixes.pubkeyhash;
    const base58PrefixScriptAddress = Params().base58Prefixes.scripthash;

    if (version === base58PrefixPubKeyAddress[0]) {
        const keyId = new CKeyID(hash);
        return Base58.encode(keyId);
    } else if (version === base58PrefixScriptAddress[0]) {
        const scriptId = new CScriptID(hash);
        return Base58.encode(scriptId);
    }

    return '';
}

function prepareObfuscatedHashes(strSeed, hashCount) {
    const MAX_SHA256_OBFUSCATION_TIMES = 255;
    const sha_input = Buffer.alloc(128);
    const sha_result = Buffer.alloc(32);
    const vstrHashes = [];

    if (strSeed.length >= sha_input.length) {
        throw new Error('Seed length exceeds the maximum allowed size');
    }

    sha_input.write(strSeed);

    if (hashCount > MAX_SHA256_OBFUSCATION_TIMES) {
        hashCount = MAX_SHA256_OBFUSCATION_TIMES;
    }

    for (let j = 1; j <= hashCount; ++j) {
        const sha256 = new CSHA256();
        sha256.update(sha_input);
        sha256.finalize(sha_result);
        const hexStr = sha_result.toString('hex').toUpperCase();
        vstrHashes[j] = hexStr;

        sha_input.fill(0);
        sha_input.write(hexStr);
    }

    return vstrHashes;
}

module.exports = {
    swapByteOrder16,
    swapByteOrder32,
    swapByteOrder64,
    hashToAddress,
    prepareObfuscatedHashes,
};