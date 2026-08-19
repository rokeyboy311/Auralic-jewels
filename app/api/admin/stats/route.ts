import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';

export async function GET() {
  try {
    const products = dbStore.getProducts();
    const orders = dbStore.getOrders();
    const users = dbStore.getUsers();

    const totalSalesUSD = orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.totalUSD : sum), 0);
    const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
    const lowStockCount = products.filter((p) => p.stock <= 3).length;

    // Recent orders
    const recentOrders = orders.slice(0, 5);

    // Sales by Category
    const salesByCategory: Record<string, number> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'Fine Jewellery';
        salesByCategory[cat] = (salesByCategory[cat] || 0) + item.totalUSD;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRevenueUSD: totalSalesUSD,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: users.length,
        pendingOrdersCount,
        lowStockCount,
        recentOrders,
        salesByCategory,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
