   M S B A M L   `   `   `  ����   MandADiscoverySuite(    "MandADiscoverySuite.DebugLogWindow   W SPresentationCore, Version=6.0.2.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=6.0.2.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35e aSystem.Windows.Controls.Ribbon, Version=6.0.2.0, Culture=neutral, PublicKeyToken=b77a5c561934e089R NWindowsBase, Version=6.0.2.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35^ ZWindowsFormsIntegration, Version=6.0.2.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35H 9http://schemas.microsoft.com/winfx/2006/xaml/presentation      R NSystem.Xaml, Version=6.0.2.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml       � Title$  Debug Log Viewer��$	��700��$
��1000�� � WindowStartupLocation$ CenterOwner=����	#FF0F1419 � 
ResizeMode$ 	CanResize=� � 	Resources    PrimaryGradient �� 
StartPoint �� EndPoint � Color � Offset  ModernButtonStyle �� 
TargetType	 �� Property
 �� Value �� 
TargetType �� CornerRadius �� Padding J� Effect3  -System.Windows.Media.Effects.DropShadowEffect   Color   	Direction   ShadowDepth   
BlurRadius   Opacity �� Triggers P� Property P� Value��%K  &	        &	 V     7   �� $	 0,0&�$	 1,1&�.��� $ 	#FF1e3c72��$ 0Q�� $ 	#FF2a5298��$ 1Q��� " ��.��� 	 � ��8
   �� 	 � ��

 ������� 	 � ��$
 0q��� 	 � ��$

 16,8q��� 	 � ��$
 14(��� 	 � ��$
 Medium"��� 	 �@�Cursor$

 Hand���� 	 � ��
 �� " ��.R��� #��z��$ 6��# z��._��� $��Center=�$��Center=�   $ 	#FF000000��$	 270Q�$ 2Q�$ 8Q�$	 0.2Q� P�  �@J�IsMouseOver$
 True��. ��� 	 � ��
 �� $	 0,0&�$	 1,1&�.��� $ 	#FF2a4c82��$ 0Q�� $ 	#FF3a62a8��$ 1Q�.��� $��20q� � RowDefinitions �� $
��Auto ��� $
��Auto ��� $��* ��� $
��Auto �.+��� $��0�� �� Orientation$ 
Horizontal=�$��0,0,0,16q�.+��� $��Debug Log Viewer�����	#FFF7FAFC$��20(�$��SemiBold"�$��Center=�$��0,0,16,0q��� ���	#FF2D3748$ 12��$	 8,4q�._��� -    ��Name$ SessionInfo��$��Session: Main�����	#FF4299E1$��12(��� $��1�����	#FF2D3748$ 8��$ 16q�$��0,0,0,16q�._��� .+��� $��Log Filtering�����	#FFE2E8F0$��14(�$��Medium"�$��0,0,0,8q��� $ 
Horizontal=�.+��� -    ��Name$ ShowVerbose��$��Verbose�����	#FFE2E8F0 d� 	IsChecked$
 TrueY�$��0,0,16,0q��� -   $ 	ShowDebug��$��Debug�����	#FFE2E8F0$
 TrueY�$��0,0,16,0q��� -   $ ShowInfo��$
��Info�����	#FFE2E8F0$
 TrueY�$��0,0,16,0q��� -   $ ShowWarning��$��Warning�����	#FFED8936$
 TrueY�$��0,0,16,0q��� -   $ 	ShowError��$��Error�����	#FFF56565$
 TrueY�$��0,0,16,0q��� -   $��Clear��#��[ ���	#FF718096$��16,0,0,0q��� $��2�����	#FF1A202C$ 8�����	#FF4A5568$��1q�._��� -    ��Name$ LogScrollViewer��$
��Auto=�$��12q�.���� -	    ��Name$ 
LogTextBox��
������ ���	#FFE2E8F0$��Consolas)�$��12(�$��0q� �� 
IsReadOnly$
 True���� $��3��$ 
Horizontal=�$��Right=�$��0,16,0,0q�.+��� -
   $ LogCount��$��	0 entries�����	#FFA0AEC0$��12(�$��Center=�$��0,0,16,0q��� -    ��Name$ ExportButton��$��
Export Log��#��[ $��0,0,12,0q����	#FF48BB78�� -   $ RefreshButton��$��Refresh��#��[ $��0,0,12,0q����	#FF4299E1�� -   $ CloseButton��$��Close��#��[ ���	#FF4A5568