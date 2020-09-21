from wasmer import Store, Module, Instance
from pathlib import Path

base_path = Path(__file__).parent
wasmFilePath = (base_path / '../../target/wasm32-unknown-unknown/debug/wasmer_template_renderer.wasm').resolve()

wasm = open(wasmFilePath, 'rb').read()

print(Instance)

instance = Instance(wasm)

# Set the subject to greet.
subject = bytes('Wasmer 🐍', 'utf-8')
length_of_subject = len(subject) + 1

# Allocate memory for the subject, and get a pointer to it.
input_pointer = instance.exports.alloc(length_of_subject)

print(input_pointer)

print(instance.exports)

# Write the subject into the memory.
memory = instance.exports.memory.uint8_view(input_pointer)
memory[0:length_of_subject] = subject
memory[length_of_subject] = 0 # C-string terminates by NULL.

# Run the `greet` function. Give the pointer to the subject.
output_pointer = instance.exports.greet(input_pointer)

# Read the result of the `greet` function.
memory = instance.exports.memory.uint8_view(output_pointer)
memory_length = len(memory)

output = []
nth = 0

while nth < memory_length:
    byte = memory[nth]

    if byte == 0:
        break

    output.append(byte)
    nth += 1

length_of_output = nth

print(bytes(output).decode())

# Deallocate the subject, and the output.
instance.exports.deallocate(input_pointer, length_of_subject)
instance.exports.deallocate(output_pointer, length_of_output)
