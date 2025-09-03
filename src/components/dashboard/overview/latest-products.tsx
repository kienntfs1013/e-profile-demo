import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import type { SxProps } from "@mui/material/styles";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/ssr/DotsThreeVertical";
import dayjs from "dayjs";

import "dayjs/locale/vi";

dayjs.locale("vi");

export interface Product {
	id: string;
	image: string;
	name: string;
	updatedAt: Date;
}

export interface LatestProductsProps {
	products?: Product[];
	sx?: SxProps;

	/** Tiêu đề thẻ — mặc định: "Thiết bị đang sử dụng" */
	title?: string;
	/** Tiền tố dòng phụ — mặc định: "Cập nhật" */
	updatedPrefix?: string;
	/** Nhãn nút xem tất cả — mặc định: "Xem tất cả" */
	viewAllText?: string;

	/** Ẩn nút menu từng dòng (ba chấm) nếu cần */
	hideRowMenu?: boolean;
}

export function LatestProducts({
	products = [],
	sx,
	title = "Thiết bị đang sử dụng",
	updatedPrefix = "Cập nhật",
	viewAllText = "Xem tất cả",
	hideRowMenu = false,
}: LatestProductsProps): React.JSX.Element {
	return (
		<Card sx={sx}>
			<CardHeader title={title} />
			<Divider />
			<List>
				{products.map((product, index) => (
					<ListItem divider={index < products.length - 1} key={product.id}>
						<ListItemAvatar>
							{product.image ? (
								<Box
									component="img"
									src={product.image}
									alt={product.name}
									sx={{ borderRadius: 1, height: 48, width: 48, objectFit: "cover" }}
								/>
							) : (
								<Box
									sx={{
										borderRadius: 1,
										backgroundColor: "var(--mui-palette-neutral-200)",
										height: 48,
										width: 48,
									}}
								/>
							)}
						</ListItemAvatar>

						<ListItemText
							primary={product.name}
							primaryTypographyProps={{ variant: "subtitle1" }}
							secondary={`${updatedPrefix} ${dayjs(product.updatedAt).format("DD/MM/YYYY HH:mm")}`}
							secondaryTypographyProps={{ variant: "body2" }}
						/>

						{!hideRowMenu && (
							<IconButton edge="end" aria-label="tác vụ">
								<DotsThreeVerticalIcon weight="bold" />
							</IconButton>
						)}
					</ListItem>
				))}
			</List>
			<Divider />
			<CardActions sx={{ justifyContent: "flex-end" }}>
				<Button
					color="inherit"
					endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
					size="small"
					variant="text"
				>
					{viewAllText}
				</Button>
			</CardActions>
		</Card>
	);
}
