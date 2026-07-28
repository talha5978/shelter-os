import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Search, Check, AlertTriangle, RefreshCw, Crown, X, Plus } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { useRevalidator } from "react-router";
import { Form, Link, type LoaderFunctionArgs, useLoaderData, useLocation, useNavigation } from "react-router";
import { toast } from "sonner";
import { createApiClient } from "~/api/client";
import { createUsersApi } from "~/api/users.api";
import { DataTable, DataTableSkeleton, TableColumnsToggle } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import AddStaffSheet from "~/components/Users/AddStaffSheet";
import UserDetailsSheet from "~/components/Users/UserDetailsSheet";
import type { AllUsersResponse } from "~/types/users";
import { invalidateCache } from "~/utils/invalidate";
import { GetPaginationControls } from "~/utils/PaginationControls";
import { getPaginationQueryPayload } from "~/utils/PaginationQueryPayload";

export const meta = () => {
	return [
		{ title: "Users & Volunteers | ShelterOS" },
		{ name: "description", content: "Manage all users - Verify, Revoke & Monitor" },
	];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const cookieHeader = request.headers.get("Cookie") ?? "";
	const client = createApiClient();
	client.setCookie(cookieHeader);

	const { q, pageIndex, pageSize } = getPaginationQueryPayload({ request });

	const usersApi = createUsersApi(client);
	const data = await usersApi.getAllUsers({
		search: q,
		pageIndex,
		pageSize,
	});

	const url = new URL(request.url);
	const userId = url.searchParams.get("userId")?.trim() ?? "";
	let userDetails = null;
	if (userId) {
		userDetails = await usersApi.fetchUserDetails(userId);
	}

	return { allUsers: data, userDetails };
};

export default function AdminUsersPage() {
	const { allUsers, userDetails } = useLoaderData<typeof loader>();

	const navigation = useNavigation();
	const location = useLocation();
	const revalidator = useRevalidator();
	const [searchParams, setSearchParams] = useSearchParams();

	const [open, setOpen] = useState(false);
	const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const usersData = allUsers.success ? allUsers.data : null;
	const users = usersData?.users ?? [];
	const pagination = usersData?.pagination;

	async function toggleVerification(userId: string) {
		const usersApi = createUsersApi();
		const resp = await usersApi.toggleVerification(userId);
		if (resp.success) {
			toast.success(resp.message);
			revalidator.revalidate();
		} else {
			toast.error(resp.error.message || "Something went wrong. Please try again.");
		}
	}

	const tableColumns: ColumnDef<AllUsersResponse["users"][number]>[] = [
		{
			id: "Sr. No.",
			accessorKey: "Sr. No.",
			header: "Sr. No.",
			cell: ({ row }) => row.index + 1,
		},
		{
			id: "Full Name",
			accessorKey: "Full Name",
			header: "Full Name",
			cell: ({ row }) => <div className="font-medium">{row.original.fullName}</div>,
		},
		{
			id: "Contact Info",
			accessorKey: "Contact Info",
			header: "Contact Info",
			cell: ({ row }) => (
				<div className="text-muted-foreground">
					<a href={`mailto:${row.original.email}`} target="_blank">
						<div className="font-semibold hover:underline-offset-4 hover:underline hover:text-primary">
							{row.original.email}
						</div>
					</a>
					<a href={`tel:${row.original.phone}`}>
						<div className="text-xs italic hover:underline-offset-4 hover:underline hover:text-primary">
							{row.original.phone}
						</div>
					</a>
				</div>
			),
		},
		{
			id: "Role",
			accessorKey: "Role",
			header: "Role",
			cell: ({ row }) => (
				<Badge variant={"secondary"}>
					{row.original.role === "admin" && <Crown />}
					{row.original.role.replace("_", " ").toUpperCase()}
				</Badge>
			),
		},
		{
			id: "Status",
			accessorKey: "Status",
			header: "Status",
			cell: ({ row }) => (
				<Badge variant={row.original.isVerified ? "success" : "destructive"}>
					{row.original.isVerified ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
					{row.original.isVerified ? "Verified" : "Access Revoked"}
				</Badge>
			),
		},
		{
			id: "Joined",
			accessorKey: "Joined",
			header: "Joined",
			cell: ({ row }) =>
				new Date(row.original.createdAt).toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				}),
		},
		{
			id: "actions",
			cell: ({ row }) => {
				const user = row.original;
				return (
					<DropdownMenu>
						<DropdownMenuTrigger>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => {
									const size = searchParams.get("size");
									const page = searchParams.get("page");
									const q = searchParams.get("q");
									setSearchParams(
										{
											...(size && { size }),
											...(page && { page }),
											...(q && { q }),
											userId: user.id,
										},
										{
											state: {
												suppressLoadingBar: true,
											},
										},
									);
									setDetailsSheetOpen(true);
								}}
							>
								View Details
							</DropdownMenuItem>

							{!user.isVerified ? (
								<DropdownMenuItem onClick={() => toggleVerification(user.id)}>
									Verify Account
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem
									variant="destructive"
									onClick={() => toggleVerification(user.id)}
								>
									Revoke Access
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				);
			},
		},
	];

	const { onPageChange, onPageSizeChange } = GetPaginationControls({});

	const table = useReactTable({
		data: users,
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: Math.ceil((pagination?.total || 0) / (pagination?.pageSize || 0)),
		state: {
			pagination: {
				pageIndex: pagination?.page ? pagination.page - 1 : 0,
				pageSize: pagination?.pageSize || 10,
			},
		},
	});

	if (!allUsers.success) {
		const error = allUsers.error;
		return (
			<div className="flex h-[70vh] items-center justify-center p-6">
				<div className="max-w-md w-full text-center">
					<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
						<AlertTriangle className="h-10 w-10 text-destructive" />
					</div>

					<h2 className="text-2xl font-semibold tracking-tight mb-2">Something went wrong</h2>

					<p className="text-muted-foreground mb-6">
						{error.message || "Failed to load users. Please try again."}
					</p>

					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Button
							onClick={() => {
								invalidateCache("all_users");
								window.location.reload();
							}}
							variant="default"
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Retry
						</Button>

						<Button variant="outline" asChild>
							<Link to="/">Go to Dashboard</Link>
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="flex-1 flex flex-col gap-6 p-6">
				<div className="flex items-center justify-between flex-wrap gap-2">
					<div>
						<h1 className="text-3xl font-semibold tracking-tight">Users Directory</h1>
						<p className="text-muted-foreground">
							Manage shelter staff and volunteers accounts, verification, and participation
						</p>
					</div>

					<Button size="lg" onClick={() => setOpen(true)}>
						<Plus className="mr-1" />
						Add New Staff
					</Button>
				</div>

				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<Form method="get" className="max-w-md">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
								<Input
									placeholder="Search by name, email or student ID..."
									name="q"
									className="pl-10 min-w-md"
								/>
							</div>
						</Form>

						<TableColumnsToggle table={table} />
					</div>

					{isFetching ? (
						<DataTableSkeleton noOfSkeletons={6} columns={tableColumns} />
					) : (
						<DataTable
							table={table}
							onPageChange={onPageChange}
							onPageSizeChange={onPageSizeChange}
							pageSize={pagination?.pageSize || 10}
							total={pagination?.total || 0}
						/>
					)}
				</div>
			</div>
			<AddStaffSheet open={open} onOpenChange={setOpen} />
			<UserDetailsSheet
				open={detailsSheetOpen}
				onOpenChange={() => {
					const size = searchParams.get("size");
					const page = searchParams.get("page");
					const q = searchParams.get("q");
					setSearchParams(
						{
							...(size && { size }),
							...(page && { page }),
							...(q && { q }),
						},
						{
							state: {
								suppressLoadingBar: true,
							},
						},
					);
					setDetailsSheetOpen(false);
				}}
				data={userDetails?.success ? userDetails.data : null}
			/>
		</>
	);
}
