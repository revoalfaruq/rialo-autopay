#[macro_use]
extern crate rialo_s_program;
use rialo_venus_proc_macro::rialo;
use rialo_s_program::{entrypoint::ProgramResult, msg};

rialo! {
    workflow {

        state {
            counter: u64
        }

        program {
            initiating fn start(&mut self) -> rialo_s_program::entrypoint::ProgramResult {
                AFTER 30 seconds CALL [check_status];
                Ok(())
            }

            handler fn check_status(&mut self) -> rialo_s_program::entrypoint::ProgramResult {
                self.counter += 1;
                Ok(())
            }
        }

    }
}
