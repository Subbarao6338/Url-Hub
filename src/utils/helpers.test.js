import { copyToClipboard, downloadFile } from './helpers';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Helpers Utilities', () => {
    beforeEach(() => {
        // Ensure document.execCommand exists in jsdom for spying/stubbing
        if (!document.execCommand) {
            document.execCommand = vi.fn();
        }

        // Mock navigator.clipboard
        Object.defineProperty(global.navigator, 'clipboard', {
            value: {
                writeText: vi.fn().mockResolvedValue(undefined)
            },
            configurable: true,
            writable: true
        });

        // Mock URL object methods
        global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid');
        global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('copyToClipboard', () => {
        it('should copy text and call callback on complete', async () => {
            const callback = vi.fn();
            copyToClipboard('test text', callback);

            await new Promise(process.nextTick);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
            expect(callback).toHaveBeenCalled();
        });

        it('should do nothing if text is empty', () => {
            const callback = vi.fn();
            copyToClipboard('', callback);
            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
            expect(callback).not.toHaveBeenCalled();
        });

        it('should fallback to execCommand when navigator.clipboard is missing', () => {
            Object.defineProperty(global.navigator, 'clipboard', {
                value: undefined,
                configurable: true,
                writable: true
            });

            const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);
            const callback = vi.fn();

            copyToClipboard('fallback text', callback);

            expect(execCommandSpy).toHaveBeenCalledWith('copy');
            expect(callback).toHaveBeenCalled();
        });

        it('should fallback to execCommand when clipboard.writeText rejects', async () => {
            navigator.clipboard.writeText.mockRejectedValue(new Error('Permission denied'));

            const execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true);
            const callback = vi.fn();

            copyToClipboard('fallback text', callback);

            await new Promise(process.nextTick);

            expect(execCommandSpy).toHaveBeenCalledWith('copy');
            expect(callback).toHaveBeenCalled();
        });
    });

    describe('downloadFile', () => {
        it('should trigger download for plaintext content', async () => {
            const appendChildSpy = vi.spyOn(document.body, 'appendChild');
            const removeChildSpy = vi.spyOn(document.body, 'removeChild');

            await downloadFile('test file content', 'test.txt', 'txt');

            expect(global.URL.createObjectURL).toHaveBeenCalled();
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
            expect(global.URL.revokeObjectURL).toHaveBeenCalled();
        });

        it('should append correct extension if missing', async () => {
            const appendChildSpy = vi.spyOn(document.body, 'appendChild');
            await downloadFile('test content', 'my-doc', 'md');

            const linkElement = appendChildSpy.mock.calls[0][0];
            expect(linkElement.download).toBe('my-doc.md');
        });
    });
});
