import { rand_8 } from "xmr-rand";
import { cn_fast_hash } from "xmr-fast-hash";
import { INTEGRATED_ID_SIZE } from "xmr-constants/address";
import { generate_key_derivation } from "xmr-crypto-ops/derivation";
import { hex_xor } from "xmr-str-utils/hex-strings";

// Copyright (c) 2014-2018, MyMonero.com
//
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
//	conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
//	of conditions and the following disclaimer in the documentation and/or other
//	materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its contributors may be
//	used to endorse or promote products derived from this software without specific
//	prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
// THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
// THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

export function makePaymentID() {
	return rand_8();
}

export function encrypt_payment_id(
	payment_id: string,
	public_key: string,
	secret_key: string,
) {
	// get the derivation from our passed viewkey, then hash that + tail to get encryption key
	const INTEGRATED_ID_SIZE_BYTES = INTEGRATED_ID_SIZE * 2;
	const ENCRYPTED_PAYMENT_ID_TAIL_BYTE = "8d";

	const derivation = generate_key_derivation(public_key, secret_key);
	const data = `${derivation}${ENCRYPTED_PAYMENT_ID_TAIL_BYTE}`;
	const pid_key = cn_fast_hash(data).slice(0, INTEGRATED_ID_SIZE_BYTES);

	const encryptedPid = hex_xor(payment_id, pid_key);

	return encryptedPid;
}

export function isValidOrNoPaymentID(pid?: string | null) {
	if (!pid) {
		return true;
	}

	return isValidShortPaymentID(pid) || isValidLongPaymentID(pid);
}

export function isValidShortPaymentID(payment_id: string) {
	return isValidPaymentID(payment_id, 16);
}

export function isValidLongPaymentID(payment_id: string) {
	console.warn("[WARN]: Long payment (plaintext) ids are deprecated");
	return isValidPaymentID(payment_id, 64);
}

function isValidPaymentID(payment_id: string, length: 16 | 64) {
	const pattern = RegExp("^[0-9a-fA-F]{" + length + "}$");
	return pattern.test(payment_id);
}