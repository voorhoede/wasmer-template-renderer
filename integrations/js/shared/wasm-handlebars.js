class WasmHandlebars {
    _wasmSource;
    _wasmTemplateRenderer;

    constructor(wasmSource) {
        this._wasmSource = wasmSource;
    }

    async init() {
        const { instance } = await this._getWasmInstance();
        this._wasmTemplateRenderer = instance.exports;
        return this;
    }

    registerPartial(name, template) {
        if (!this._wasmTemplateRenderer) {
            throw Error('Initialize the template renderer!');
        }

        const nameUtf8 = WasmHandlebars._nullTerminated(name);
        const templateUtf8 = WasmHandlebars._nullTerminated(template);

        const nameUtf8Length = nameUtf8.length;
        const templateUtf8Length = templateUtf8.length;

        const namePtr = this._alloc(nameUtf8Length);
        const templatePtr = this._alloc(templateUtf8Length);

        this._writeToBuffer(namePtr, nameUtf8Length, nameUtf8);
        this._writeToBuffer(templatePtr, templateUtf8Length, templateUtf8);

        this._registerPartial(namePtr, templatePtr);

        this._dealloc(namePtr, nameUtf8Length);
        this._dealloc(templatePtr, templateUtf8Length);
    }

    render(name, data) {
        if (!this._wasmTemplateRenderer) {
            throw Error('Initialize the template renderer!');
        }

        const nameUtf8 = WasmHandlebars._nullTerminated(name);
        const dataUtf8 = WasmHandlebars._nullTerminated(data);

        const nameUtf8Length = nameUtf8.length;
        const dataUtf8Length = dataUtf8.length;

        const namePtr = this._alloc(nameUtf8Length);
        const dataPtr = this._alloc(dataUtf8Length);

        this._writeToBuffer(namePtr, nameUtf8Length, nameUtf8);
        this._writeToBuffer(dataPtr, dataUtf8Length, dataUtf8);

        const htmlPtr = this._renderTemplate(namePtr, dataPtr);

        const { string: html, stringBytesLength } = this._readString(htmlPtr);

        this._dealloc(namePtr, nameUtf8Length);
        this._dealloc(dataPtr, dataUtf8Length);
        this._dealloc(htmlPtr, stringBytesLength);

        return html;
    }

    _isWebAssemblySupported() {
        try {
            if (typeof WebAssembly === "object") {
                const module = new WebAssembly.Module(new Uint8Array([0x00, 0x61, 0x73, 0x6D, 0x01, 0x00, 0x00, 0x00]));

                if (module instanceof WebAssembly.Module) {
                    const moduleInstance = new WebAssembly.Instance(module);
                    return (moduleInstance instanceof WebAssembly.Instance);
                }
            }
        } catch (err) { }

        return false;
    }

    _getWasmInstance() {
        if (!this._isWebAssemblySupported()) {
            throw Error("Webassembly is not supported.");
        }

        if (typeof WebAssembly.instantiateStreaming === "function") {
            return WebAssembly.instantiateStreaming(this._wasmSource);
        }

        return WebAssembly.instantiate(this._wasmSource);
    }

    static _encodeString(string) {
        return new TextEncoder().encode(string);
    }

    static _decodeString(bytes) {
        return new TextDecoder().decode(new Uint8Array(bytes));
    }

    _alloc(length) {
        return this._wasmTemplateRenderer.alloc(length);
    }

    _dealloc(ptr, length) {
        this._wasmTemplateRenderer.dealloc(ptr, length);
    }

    static _nullTerminated(string) {
        const utf8Encoded = WasmHandlebars._encodeString(string);
        return new Uint8Array([...utf8Encoded, 0]);
    }

    _writeToBuffer(ptr, length, data) {
        new Uint8Array(this._wasmTemplateRenderer.memory.buffer, ptr, length).set(data);
    }

    _readFromBuffer(ptr) {
        return new Uint8Array(this._wasmTemplateRenderer.memory.buffer, ptr);
    }

    _registerPartial(namePtr, templatePtr) {
        this._wasmTemplateRenderer.register_partial(namePtr, templatePtr);
    }

    _renderTemplate(namePtr, dataPtr) {
        return this._wasmTemplateRenderer.render(namePtr, dataPtr);
    }

    _readString(ptr) {
        const memory = this._readFromBuffer(ptr);
        const stringBytes = [];

        for (const byte of memory) {
            if (byte === 0) break;
            stringBytes.push(byte)
        }

        return {
            string: WasmHandlebars._decodeString(stringBytes),
            stringBytesLength: stringBytes.length
        }
    }
}

module.exports = WasmHandlebars;