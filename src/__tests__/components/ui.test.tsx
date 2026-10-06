import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { StatCard } from "@/components/common/StatCard";
import { Table } from "@/components/common/Table";
import { AccessDenied } from "@/components/common/AccessDenied";

describe("Reusable UI Components", () => {
  it("Button renders text and responds to click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("Button shows loading state and disables user interaction", () => {
    render(<Button isLoading>Submit</Button>);
    const btn = screen.getByRole("button", { name: /submit/i });
    expect(btn).toBeDisabled();
  });

  it("Badge renders variant styling cleanly", () => {
    render(<Badge variant="success">Confirmed</Badge>);
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });

  it("StatCard renders title, value and subtext", () => {
    render(
      <StatCard
        title="Total Dues"
        value="₹1,25,000.00"
        subtext="Across 48 occupied flats"
      />
    );
    expect(screen.getByText("Total Dues")).toBeInTheDocument();
    expect(screen.getByText("₹1,25,000.00")).toBeInTheDocument();
    expect(screen.getByText("Across 48 occupied flats")).toBeInTheDocument();
  });

  it("Table renders headers, data rows and responds to empty state", () => {
    const columns = [
      { header: "Name", accessor: (row: any) => row.name },
      { header: "Role", accessor: (row: any) => row.role },
    ];
    const data = [
      { id: "1", name: "Alice", role: "Admin" },
      { id: "2", name: "Bob", role: "Resident" },
    ];

    const { rerender } = render(
      <Table
        columns={columns}
        data={data}
        keyExtractor={(row) => row.id}
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    rerender(
      <Table
        columns={columns}
        data={[]}
        keyExtractor={(row) => row.id}
        emptyMessage="No members found"
      />
    );

    expect(screen.getByText("No members found")).toBeInTheDocument();
  });

  it("AccessDenied displays 403 Forbidden message", () => {
    render(<AccessDenied message="Caller lacks required privileges" />);
    expect(screen.getByText(/Access Restricted \(403\)/i)).toBeInTheDocument();
    expect(screen.getByText("Caller lacks required privileges")).toBeInTheDocument();
  });
});
