// C:\DREAMAX\e-profile\material-kit-react\src\services\upload.service.ts
import { api } from "@/lib/api/client";

type RawUploadResponse = { status: "success" | "error"; message: string };
export type UploadResult = { ok: boolean; url?: string; path?: string; message?: string; error?: string };

const API_BASE = process.env.NEXT_PUBLIC_EPROFILE_API || "https://api-eprofile.pickleballplus.vn";
const MAX_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB ?? 2);
const MAX_WIDTH = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_WIDTH ?? 1600);

function tryExtractPath(u?: string): string | undefined {
	if (!u) return undefined;
	try {
		return new URL(u).pathname;
	} catch {
		return u.startsWith("/") ? u : undefined;
	}
}

function isLocalhost(): boolean {
	if (typeof window === "undefined") return false;
	const h = window.location.hostname;
	return h === "localhost" || h === "127.0.0.1";
}

async function compressOnce(file: File | Blob, maxWidth: number, quality = 0.82): Promise<Blob> {
	const type = (file as any).type || "image/jpeg";
	if (!type?.startsWith?.("image/")) return file;
	const bmp = await createImageBitmap(file);
	let w = bmp.width,
		h = bmp.height;
	if (w > maxWidth) {
		const s = maxWidth / w;
		w = maxWidth;
		h = Math.round(h * s);
	}
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d")!;
	ctx.drawImage(bmp, 0, 0, w, h);
	const mime = type === "image/png" ? "image/png" : "image/jpeg";
	const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), mime, quality));
	bmp.close();
	return blob;
}

async function smartCompress(file: File | Blob, maxBytes: number): Promise<Blob> {
	let out: Blob = file;
	if ((file as any).size && (file as any).size <= maxBytes) return out;

	out = await compressOnce(file, MAX_WIDTH, 0.82);
	if (out.size <= maxBytes) return out;

	// thêm 1 vòng nén nữa nếu vẫn to: giảm 20% chiều rộng và chất lượng
	out = await compressOnce(out, Math.round(MAX_WIDTH * 0.8), 0.7);
	return out;
}

export async function uploadFile(
	file: File | Blob,
	opts?: { filename?: string; token?: string; direct?: boolean }
): Promise<UploadResult> {
	try {
		const maxBytes = MAX_MB * 1024 * 1024;
		let payload = await smartCompress(file, maxBytes);

		const name = opts?.filename || (file as any)?.name || "upload.bin";
		const form = new FormData();
		form.append("file", payload, name);

		const headers = opts?.token ? { Authorization: opts.token } : undefined;

		const candidates: string[] = [];
		if (!opts?.direct && isLocalhost()) candidates.push("/api/proxy/fileupload");
		candidates.push(`${API_BASE}/api/fileupload`);

		let lastErr: any = null;

		for (const ep of candidates) {
			try {
				if (ep.startsWith("/")) {
					const resp = await fetch(ep, { method: "POST", headers, body: form });
					if (resp.status === 404) continue;
					if (resp.status === 413) throw new Error("413");
					const data = (await resp.json()) as RawUploadResponse;
					if (data?.status === "success") {
						const url = data.message;
						return { ok: true, url, path: tryExtractPath(url), message: data.message };
					}
					lastErr = new Error(data?.message || "Upload failed");
					continue;
				} else {
					const { data } = await api.post<RawUploadResponse>(ep, form, {
						headers,
						maxBodyLength: Infinity,
					});
					if (data?.status === "success") {
						const url = data.message;
						return { ok: true, url, path: tryExtractPath(url), message: data.message };
					}
					lastErr = new Error(data?.message || "Upload failed");
				}
			} catch (e: any) {
				if (String(e?.message).includes("413")) {
					return { ok: false, error: "Tệp quá lớn (413). Hãy chọn ảnh nhỏ hơn hoặc giảm cấu hình nén." };
				}
				lastErr = e;
			}
		}

		return { ok: false, error: lastErr?.message || "Upload failed" };
	} catch (e: any) {
		return { ok: false, error: e?.message || "Upload error" };
	}
}
