"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
	Avatar,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Divider,
	FormControl,
	InputLabel,
	OutlinedInput,
	Stack,
} from "@mui/material";

type Initial = {
	id: string;
	name: string;
	image: string;
	updatedAt: string;
};

export default function ClientPage({ initial }: { initial: Initial }): React.JSX.Element {
	const sp = useSearchParams();

	// Cho phép override bằng query runtime, nếu không có thì dùng initial (server truyền xuống)
	const nameInit = sp.get("name") ?? initial.name;
	const imageInit = sp.get("image") ?? initial.image;

	const [image, setImage] = React.useState<string | undefined>(imageInit || undefined);
	const fileRef = React.useRef<HTMLInputElement>(null);

	const pick = () => fileRef.current?.click();
	const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) setImage(URL.createObjectURL(f));
	};

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Thiết bị" subheader="Sửa thông tin" />
				<Divider />
				<CardContent>
					<Stack spacing={3}>
						<Stack direction="row" spacing={2} alignItems="center">
							<Avatar src={image} sx={{ width: 96, height: 96 }} />
							<Button variant="outlined" onClick={pick}>
								Tải ảnh lên
							</Button>
							{image ? (
								<Button variant="text" color="error" onClick={() => setImage(undefined)}>
									Xóa ảnh
								</Button>
							) : null}
							<input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
						</Stack>

						<FormControl fullWidth required>
							<InputLabel>Tên thiết bị</InputLabel>
							<OutlinedInput label="Tên thiết bị" name="name" defaultValue={nameInit} />
						</FormControl>
					</Stack>
				</CardContent>
				<Divider />
				<CardActions sx={{ justifyContent: "flex-end" }}>
					<Button variant="contained">Lưu</Button>
				</CardActions>
			</Card>
		</Stack>
	);
}
