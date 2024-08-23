import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { fromB64, toB64 } from "@mysten/sui/utils";

const privateKey = {
  key1: "ABEInw/UBNbsLJsOPwMp3kJaB326ZLp+cnsSGLz3/OSY",
  key2: "AINoB9qciNvSiPfq61EUpa/2B4xygkfR+AhOVhitf0dI",
};

const privateKeyBytes = fromB64(privateKey.key1);

const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

const publicKey = keypair.getPublicKey();
const address = publicKey.toSuiAddress();

console.log("address", address);
