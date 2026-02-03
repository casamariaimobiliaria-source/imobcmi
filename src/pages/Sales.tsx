import React from 'react';
import { Plus } from 'lucide-react';

// UI Components
import { Button } from '../components/ui/Button';
import { SalesTable } from '../components/sales/SalesTable';
import { SalesFilters } from '../components/sales/SalesFilters';
import { SaleForm } from '../components/sales/SaleForm';
import { ReceiptModal } from '../components/sales/ReceiptModal';

// Hooks
import { useSalesManager } from '../hooks/useSalesManager';

export const Sales = () => {
  const { state, actions } = useSalesManager();
  const {
    view, editingId, formData, receiptSale, isExporting, receiptRef,
    searchTerm, showFilters, filterDateStart, filteredSales,
    agents, clients, developers, user
  } = state;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {view === 'list' ? (
        <>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
                {user?.role === 'agent' ? <>Minhas <span className="text-cyan-400">Vendas</span></> : <>Gestão de <span className="text-cyan-400">Vendas</span></>}
              </h1>
              <p className="text-slate-500 font-bold text-[9px] md:text-[10px] uppercase tracking-widest mt-1 italic">
                {user?.role === 'agent' ? 'Histórico de transações e comissões.' : 'Controle de transações e comissionamento.'}
              </p>
            </div>
            {user?.role !== 'agent' && (
              <Button onClick={actions.handleOpenAdd} icon={Plus}>
                Nova Venda
              </Button>
            )}
          </div>

          <SalesFilters
            searchTerm={searchTerm}
            setSearchTerm={actions.setSearchTerm}
            showFilters={showFilters}
            setShowFilters={actions.setShowFilters}
            onClear={actions.onClearFilters}
            hasFilters={!!searchTerm || !!filterDateStart}
            filterDateStart={filterDateStart}
            setFilterDateStart={actions.setFilterDateStart}
          />

          <div className="premium-card !rounded-3xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
            <SalesTable
              sales={filteredSales}
              agents={agents}
              user={user}
              onEdit={actions.handleEdit}
              onDelete={actions.handleDelete}
              onReceipt={actions.setReceiptSale}
            />
          </div>
        </>
      ) : (
        <SaleForm
          formData={formData}
          setFormData={actions.setFormData}
          agents={agents}
          clients={clients}
          developers={developers}
          user={user}
          onSubmit={actions.handleSubmit}
          onCancel={() => actions.setView('list')}
          editingId={editingId}
        />
      )}

      <ReceiptModal
        sale={receiptSale}
        onClose={() => actions.setReceiptSale(null)}
        agents={agents}
        clients={clients}
        developers={developers}
        onExport={actions.handleExportPDF}
        isExporting={isExporting}
        receiptRef={receiptRef}
      />
    </div>
  );
};
