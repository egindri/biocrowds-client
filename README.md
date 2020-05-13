# INSTRUCTIONS.md

Esse arquivo instrui como executar o programa.


# Orientações Gerais

1. As orientações para execução da aplicação ou o acesso a mesma devem estar
detalhados. Dê preferência a publicação em um ambiente web público;

2. Os códigos fonte e scripts de banco de dados gerados (DDL e DML) devem ser
disponibilizados. Dê preferência para alguma plataforma de hospedagem de código;

3. A interpretação da especificação faz parte da avaliação;


# Requisitos Não Funcionais

1. UX e UI são de livre exploração;

2. Estrutura de banco de dados é de livre exploração;

3. SPA (Single-page application);

4. Suporte mínimo a última versão do Chrome;


# Requisitos Funcionais

1. Uma caixa de seleção deve ser disponibilizada, onde:
a. Opções a serem apresentadas (nessa ordem):
i. Rio Grande do Sul
ii. Santa Catarina
iii. Paraná
b. Opção default:
i. Santa Catarina

2. Tendo um estado selecionado na caixa de seleção anterior, a bandeira do mesmo deve
ser renderizada;

3. A aplicação deverá contemplar os seguintes dados:
a. Entidades:
i. ESTADO
ii. CIDADE
b. Carga Inicial:
i. ESTADO: As opções listadas no item 1.a;
ii. CIDADE: Quaisquer uma ou mais cidades dos estados correspondentes;

4. A aplicação deverá permitir as ações seguintes, com garantias de manter a base de
dados com estas regras:
a. Inserção:
i. Não permitir nomes repetidos para cidades dentro de um mesmo estado;
b. Exclusão:
i. Não permitir que cidades do estado Rio Grande do Sul sejam excluídas;
c. Listagem:
i. A lista deve conter os dados das cidades e suas relações;

5. Deve ser possível armazenar a população de cada cidade (dado obrigatório), e, com isso:
a. Deve ser possível realizar a listagem dos estados, onde:
i. Se exiba a população de cada estado, de acordo com as cidades relacionadas
ao mesmo;
b. Consulta de custo populacional:
i. Cada cidadão custa ao estado US$ 123.45 (valor em dólar);
ii. Há uma correção de cálculo adicional onde a população acima de 50000
recebe um ajuste de -12.3% no valor. Ou seja, os cidadões de número 50001
ou superior custam menos ao estado do que os cidadões de número 50000
ou inferior.
iii. As variáveis de custo populacional (valor por pessoa [123.45], valor de corte
para desconto [50000] e desconto [12.3]) são configurações, mas não
precisam ser manipuladas via aplicação;
iv. Deve ser possível ao usuário consultar o custo populacional de cada estado
(em reais), considerando a cotação do dia do dólar (realizar consulta a algum
webservice público com essa finalidade);

6. A aplicação deverá ser capaz de, num processo em lote, inserir N cidades:
a. Deve ser possível selecionar estados distintos para cada cidade no processamento
em lote;