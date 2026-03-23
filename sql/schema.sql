-- ============================================================
-- ARKAD TASK SYSTEM — Schema SQL para Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABELA: profiles (extensão do auth.users do Supabase) ──────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'usuario' CHECK (role IN ('admin', 'gestor', 'financeiro', 'usuario')),
  area TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para criar profile automaticamente ao registrar usuário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'usuario')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── TABELA: clientes ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  empresa TEXT,
  email TEXT,
  telefone TEXT,
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  segmento TEXT,
  valor_mensal NUMERIC(10,2) DEFAULT 0,
  plano TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'risco', 'churn')),
  data_entrada DATE,
  data_saida DATE,
  motivo_churn TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABELA: tarefas ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  criado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('urgente', 'alta', 'media', 'baixa')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'em_revisao', 'concluida', 'atrasada', 'cancelada')),
  data_vencimento DATE,
  data_conclusao TIMESTAMPTZ,
  is_atrasada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABELA: comentarios_tarefa ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comentarios_tarefa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tarefa_id UUID NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  conteudo TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABELA: checklist_tarefa ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklist_tarefa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tarefa_id UUID NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABELA: notificacoes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT,
  lida BOOLEAN DEFAULT FALSE,
  tipo TEXT DEFAULT 'info' CHECK (tipo IN ('info', 'tarefa', 'cliente', 'alerta')),
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ÍNDICES para performance ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_vencimento ON tarefas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_tarefas_cliente ON tarefas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_responsavel ON clientes(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_tarefa ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário vê o próprio, admin vê todos
CREATE POLICY "Profiles: leitura própria" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles: admin lê todos" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Profiles: atualização própria" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles: admin atualiza todos" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Profiles: admin insere" ON profiles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Clientes: todos autenticados leem, admin/gestor escrevem
CREATE POLICY "Clientes: leitura autenticados" ON clientes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Clientes: escrita admin/gestor" ON clientes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor'))
);

-- Tarefas: todos autenticados leem, responsável ou admin escrevem
CREATE POLICY "Tarefas: leitura autenticados" ON tarefas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Tarefas: inserção autenticados" ON tarefas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Tarefas: atualização responsável ou admin" ON tarefas FOR UPDATE USING (
  responsavel_id = auth.uid() OR criado_por = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'gestor'))
);
CREATE POLICY "Tarefas: exclusão admin" ON tarefas FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Comentários: todos autenticados leem, autor escreve
CREATE POLICY "Comentarios: leitura" ON comentarios_tarefa FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Comentarios: inserção" ON comentarios_tarefa FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Comentarios: exclusão autor" ON comentarios_tarefa FOR DELETE USING (autor_id = auth.uid());

-- Checklist: todos autenticados
CREATE POLICY "Checklist: leitura" ON checklist_tarefa FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Checklist: escrita" ON checklist_tarefa FOR ALL USING (auth.uid() IS NOT NULL);

-- Notificações: usuário vê as próprias
CREATE POLICY "Notificacoes: próprias" ON notificacoes FOR ALL USING (usuario_id = auth.uid());

-- ─── FUNÇÃO: marcar tarefas atrasadas automaticamente ────────────────────────
CREATE OR REPLACE FUNCTION marcar_tarefas_atrasadas()
RETURNS void AS $$
BEGIN
  UPDATE tarefas
  SET status = 'atrasada', is_atrasada = TRUE, updated_at = NOW()
  WHERE data_vencimento < CURRENT_DATE
    AND status NOT IN ('concluida', 'cancelada', 'atrasada');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── FUNÇÃO: atualizar updated_at automaticamente ────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON tarefas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
