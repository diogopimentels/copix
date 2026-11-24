'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type Ponto = {
  data: string;
  valor: number;
};

export function GraficoPagamentos({ dados }: { dados: Ponto[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="data" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(valor) =>
              Number(valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            }
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary) / 0.15)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
