"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function Page(): React.JSX.Element {
	const params = useSearchParams();
	const athlete = params.get("athlete") ?? "";
	const [image, setImage] = React.useState<string | undefined>(undefined);
	const fileRef = React.useRef<HTMLInputElement>(null);
	const pick = () => fileRef.current?.click();
	const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		if (f) setImage(URL.createObjectURL(f));
	};

	return (
		<Stack spacing={3} sx={{ width: "100%" }}>
			<Card>
				<CardHeader title="Thiết bị" subheader="Nhập thông tin" />
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
							<OutlinedInput label="Tên thiết bị" name="name" />
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
