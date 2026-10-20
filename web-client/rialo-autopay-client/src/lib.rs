// Copyright (c) Subzero Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

wit_bindgen::generate!({
    world: "rialo:rialo-autopay/host",
});

use crate::exports::rialo::rialo_autopay::rialo_autopay::{
    Guest,
    Pubkey as WITPubkey,
    Instruction as WITInstruction,
    AccountMeta as WITAccountMeta,
};

use rialo_autopay::reexports::rialo_s_program::{
    instruction::Instruction as RustInstruction,
    pubkey::Pubkey as RustPubkey,
};

impl TryInto<RustPubkey> for WITPubkey {
    type Error = &'static str;

    fn try_into(self) -> Result<RustPubkey, Self::Error> {
        let array: [u8; 32] = self.bytes.try_into().map_err(|_| "Invalid pubkey length")?;
        Ok(RustPubkey::new_from_array(array))
    }
}

impl From<RustInstruction> for WITInstruction {
    fn from(rust_instruction: RustInstruction) -> Self {
        WITInstruction {
            program_id: WITPubkey { bytes: rust_instruction.program_id.to_bytes().to_vec() },
            accounts: rust_instruction
                .accounts
                .iter()
                .map(|acc| WITAccountMeta {
                    pubkey: WITPubkey { bytes: acc.pubkey.to_bytes().to_vec() },
                    is_signer: acc.is_signer,
                    is_writable: acc.is_writable,
                })
                .collect(),
            data: rust_instruction.data,
        }
    }
}

struct Host;
impl Guest for Host {
    fn start(
            program_id: WITPubkey,
            payer: WITPubkey,
            workflow_pda_slug: String
        ) -> Result<WITInstruction, String> {
            let program_id = program_id.try_into()?;
            let payer = payer.try_into()?;
            Ok(
                rialo_autopay::interface::start(
                    &program_id, &payer, workflow_pda_slug,

                ).into()
            )
        }
}

export!(Host);
